// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Distribute} from "../script/Distribute.s.sol";
import {Suite} from "../src/Suite.sol";
import {MockSettlementToken} from "./mocks/MockSettlementToken.sol";

/// The seeded usage/distribution workflow, end to end, locally: reviewed JSON in
/// -> allocations -> Suite.distribute -> balances. Covers the two invariants the
/// split must never break (never overspend the pool; zero allocations allowed).
contract DistributeTest is Test {
    Distribute internal script;
    Suite internal suite;
    MockSettlementToken internal token;

    address internal owner = makeAddr("ownerOracle");
    address internal memberA = makeAddr("memberA");
    address internal memberB = makeAddr("memberB");
    address internal memberC = makeAddr("memberC");

    uint256 internal constant POOL = 1_000_000; // 1.0 token at 6 dp

    function setUp() public {
        script = new Distribute();
        token = new MockSettlementToken("USD Coin", "USDC", 6);
        suite = new Suite(address(token), owner);
        token.mint(address(suite), POOL);
    }

    function _usage(uint256 wA, uint256 wB, uint256 wC)
        internal
        view
        returns (Distribute.Usage memory usage)
    {
        usage.recipients = new address[](3);
        usage.recipients[0] = memberA;
        usage.recipients[1] = memberB;
        usage.recipients[2] = memberC;
        usage.weights = new uint256[](3);
        usage.weights[0] = wA;
        usage.weights[1] = wB;
        usage.weights[2] = wC;
    }

    function test_LoadUsage_ParsesExampleFile() public view {
        Distribute.Usage memory usage = script.loadUsage("script/usage.example.json");
        assertEq(usage.recipients.length, 3);
        assertEq(usage.weights.length, 3);
        assertEq(usage.weights[0], 1200);
        assertEq(usage.weights[2], 0, "example file exercises the zero-usage member");
    }

    function test_Plan_SplitsProRata() public view {
        Distribute.Plan memory p = script.plan(_usage(1200, 800, 0), POOL, 0);

        assertEq(p.distributable, POOL);
        assertEq(p.amounts[0], 600_000, "60% of usage");
        assertEq(p.amounts[1], 400_000, "40% of usage");
        assertEq(p.amounts[2], 0, "no usage, no payout");
        assertEq(p.total, POOL);
        assertEq(p.remainder, 0);
    }

    /// Rounding must never let the plan ask Suite for more than it holds.
    function test_Plan_NeverExceedsPool() public view {
        Distribute.Plan memory p = script.plan(_usage(1, 1, 1), POOL, 0);
        assertLe(p.total, POOL, "overspend");
        assertEq(p.amounts[0] + p.amounts[1] + p.amounts[2] + p.remainder, POOL, "value lost");
        assertEq(p.remainder, 1, "1 unit of dust carries to the next period");
    }

    /// Nobody used anything: every allocation is zero, the pool carries forward,
    /// and nothing reverts.
    function test_Plan_AllZeroUsage() public view {
        Distribute.Plan memory p = script.plan(_usage(0, 0, 0), POOL, 0);
        assertEq(p.total, 0);
        assertEq(p.remainder, POOL);
    }

    function test_Plan_EmptyPool() public view {
        Distribute.Plan memory p = script.plan(_usage(1200, 800, 0), 0, 0);
        assertEq(p.total, 0);
        assertEq(p.distributable, 0);
    }

    /// DISTRIBUTE_MAX lets the demo split part of the pool and keep a visible
    /// balance on the counter.
    function test_Plan_RespectsCap() public view {
        Distribute.Plan memory p = script.plan(_usage(1200, 800, 0), POOL, 500_000);
        assertEq(p.distributable, 500_000);
        assertEq(p.amounts[0], 300_000);
        assertEq(p.amounts[1], 200_000);
        assertEq(p.total, 500_000);
    }

    function test_Plan_CapAbovePoolIsClamped() public view {
        Distribute.Plan memory p = script.plan(_usage(1, 1, 0), POOL, POOL * 10);
        assertEq(p.distributable, POOL);
        assertLe(p.total, POOL);
    }

    /// A hand-edited usage file is exactly where a mismatch happens, so the
    /// loader has to catch it before anything reaches the chain.
    function test_LoadUsage_RevertsOnLengthMismatch() public {
        vm.expectRevert(abi.encodeWithSelector(Distribute.UsageLengthMismatch.selector, 3, 2));
        script.loadUsage("test/fixtures/usage.mismatch.json");
    }

    function test_LoadUsage_RevertsOnZeroRecipient() public {
        vm.expectRevert(abi.encodeWithSelector(Distribute.ZeroRecipient.selector, 1));
        script.loadUsage("test/fixtures/usage.zero-recipient.json");
    }

    /// The whole workflow: plan from seeded usage, then settle it on-chain.
    function test_PlanThenDistribute_Settles() public {
        Distribute.Plan memory p = script.plan(_usage(1200, 800, 0), suite.poolBalance(), 0);

        vm.prank(owner);
        suite.distribute(p.recipients, p.amounts);

        assertEq(token.balanceOf(memberA), 600_000);
        assertEq(token.balanceOf(memberB), 400_000);
        assertEq(token.balanceOf(memberC), 0);
        assertEq(suite.poolBalance(), p.remainder);
        assertEq(suite.period(), 1);
    }

    /// Fuzz the invariant directly: whatever the weights, the plan never
    /// overspends and never loses value.
    function testFuzz_Plan_ConservesValue(uint96 wA, uint96 wB, uint96 wC, uint96 pool)
        public
        view
    {
        Distribute.Plan memory p = script.plan(_usage(wA, wB, wC), pool, 0);
        assertLe(p.total, pool);
        assertEq(p.total + p.remainder, pool);
    }
}

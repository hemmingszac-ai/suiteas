// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Suite} from "../src/Suite.sol";
import {MockSettlementToken} from "./mocks/MockSettlementToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SuiteTest is Test {
    Suite internal suite;
    MockSettlementToken internal token;

    address internal owner = makeAddr("owner");
    address internal memberA = makeAddr("memberA");
    address internal memberB = makeAddr("memberB");
    address internal memberC = makeAddr("memberC");

    function setUp() public {
        // Fuji USDC shape (6 dp) — the temporary fallback token.
        token = new MockSettlementToken("USD Coin", "USDC", 6);
        suite = new Suite(address(token), owner);
        // Seed the pool as if x402 had settled koha here.
        token.mint(address(suite), 1_000_000); // 1.0 token (6 dp)
    }

    function _members() internal view returns (address[] memory m) {
        m = new address[](2);
        m[0] = memberA;
        m[1] = memberB;
    }

    function test_Constructor_WiresTokenAndOwner() public view {
        assertEq(address(suite.settlementToken()), address(token));
        assertEq(suite.owner(), owner);
    }

    function test_Constructor_RejectsZeroToken() public {
        vm.expectRevert(Suite.ZeroSettlementToken.selector);
        new Suite(address(0), owner);
    }

    function test_PoolBalance_ReflectsHoldings() public view {
        assertEq(suite.poolBalance(), 1_000_000);
    }

    function test_Distribute_SplitsByAmounts() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 600_000;
        amounts[1] = 400_000;

        vm.prank(owner);
        suite.distribute(_members(), amounts);

        assertEq(token.balanceOf(memberA), 600_000);
        assertEq(token.balanceOf(memberB), 400_000);
        assertEq(suite.period(), 1);
    }

    /// The important invariant: no wei lost. Sum(paid out) + remainder == start.
    function test_Distribute_NoWeiLost() public {
        uint256 start = suite.poolBalance();

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 333_333;
        amounts[1] = 333_333; // deliberately leaves a remainder of 333_334

        vm.prank(owner);
        suite.distribute(_members(), amounts);

        uint256 paidOut = token.balanceOf(memberA) + token.balanceOf(memberB);
        uint256 remaining = suite.poolBalance();
        assertEq(paidOut + remaining, start, "wei lost");
        assertEq(remaining, 333_334, "remainder should carry to next period");
    }

    /// Zero-amount members must succeed, not revert (thesis, not edge case).
    function test_Distribute_ZeroAmountAllowed() public {
        address[] memory m = new address[](3);
        m[0] = memberA;
        m[1] = memberB; // no usage this period
        m[2] = memberC;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 500_000;
        amounts[1] = 0;
        amounts[2] = 500_000;

        vm.prank(owner);
        suite.distribute(m, amounts);

        assertEq(token.balanceOf(memberA), 500_000);
        assertEq(token.balanceOf(memberB), 0);
        assertEq(token.balanceOf(memberC), 500_000);
        assertEq(suite.poolBalance(), 0);
    }

    function test_Distribute_RevertsWhenExceedsPool() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 700_000;
        amounts[1] = 400_000; // total 1.1 tokens > 1.0 pooled

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(Suite.ExceedsPool.selector, 1_100_000, 1_000_000));
        suite.distribute(_members(), amounts);
    }

    function test_Distribute_RevertsOnLengthMismatch() public {
        address[] memory m = new address[](2);
        m[0] = memberA;
        m[1] = memberB;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100_000;

        vm.prank(owner);
        vm.expectRevert(Suite.LengthMismatch.selector);
        suite.distribute(m, amounts);
    }

    function test_Distribute_OnlyOwner() public {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1;
        amounts[1] = 1;

        vm.prank(memberA);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, memberA));
        suite.distribute(_members(), amounts);
    }

    /// The settlement token is not fixed and dNZD's decimals are unknown, so the
    /// pool must behave identically at another decimals value. Nothing in Suite
    /// reads decimals — this test is what lets us swap the token later without
    /// touching the contract.
    function test_Distribute_DecimalsAgnostic() public {
        MockSettlementToken token18 = new MockSettlementToken("Placeholder", "TEST", 18);
        Suite suite18 = new Suite(address(token18), owner);
        token18.mint(address(suite18), 1e18);

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 6e17;
        amounts[1] = 0; // zero allocation still fine at any decimals

        vm.prank(owner);
        suite18.distribute(_members(), amounts);

        assertEq(token18.balanceOf(memberA), 6e17);
        assertEq(token18.balanceOf(memberB), 0);
        assertEq(suite18.poolBalance(), 4e17, "remainder carries at 18 dp too");
    }
}

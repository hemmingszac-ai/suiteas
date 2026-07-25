// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {Suite} from "../src/Suite.sol";
import {UsageSplit} from "../src/UsageSplit.sol";

/// @title Distribute — the seeded usage split (flow 3).
/// @notice Reads hand-seeded usage from a reviewed JSON file, computes each
/// member's pro-rata allocation, and calls {Suite-distribute}. This is the
/// smallest thing that makes the on-chain split real for the demo; there is no
/// database yet and metering is off-chain by design (ARCHITECTURE.md).
///
/// Input file (default `script/usage.example.json`, override with USAGE_FILE):
///   { "recipients": ["0x..", ...], "usage": [1200, 800, 0], ... }
/// `recipients` and `usage` must be the same length. Zero usage is allowed and
/// produces a zero allocation.
///
/// Environment:
///   SUITE_ADDRESS    the deployed Suite (defaults to deployments/<chainId>.json)
///   USAGE_FILE       path to the usage JSON, relative to contracts/
///   DISTRIBUTE_MAX   optional cap in atomic units; defaults to the whole pool
///
/// Dry run (prints the plan, broadcasts nothing):
///   forge script script/Distribute.s.sol --rpc-url fuji
/// Broadcast as the owner/oracle wallet:
///   forge script script/Distribute.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
contract Distribute is Script {
    using UsageSplit for uint256[];

    struct Usage {
        address[] recipients;
        uint256[] weights;
    }

    struct Plan {
        address[] recipients;
        uint256[] amounts;
        uint256 distributable;
        uint256 total;
        uint256 remainder;
    }

    error MissingSuiteAddress();
    error UsageLengthMismatch(uint256 recipients, uint256 usage);
    error NoRecipients();
    error ZeroRecipient(uint256 index);
    error ExceedsPool(uint256 total, uint256 pool);

    /// @notice Parse the reviewed usage file.
    function loadUsage(string memory path) public view returns (Usage memory usage) {
        string memory json = vm.readFile(path);
        usage.recipients = vm.parseJsonAddressArray(json, ".recipients");
        usage.weights = vm.parseJsonUintArray(json, ".usage");

        if (usage.recipients.length == 0) revert NoRecipients();
        if (usage.recipients.length != usage.weights.length) {
            revert UsageLengthMismatch(usage.recipients.length, usage.weights.length);
        }
        for (uint256 i; i < usage.recipients.length; ++i) {
            if (usage.recipients[i] == address(0)) revert ZeroRecipient(i);
        }
    }

    /// @notice Turn usage weights + an available balance into a distribution plan.
    /// @param pool The Suite's current settlement-token balance, atomic units.
    /// @param cap Optional ceiling on what to split this period; 0 means "the whole pool".
    function plan(Usage memory usage, uint256 pool, uint256 cap)
        public
        pure
        returns (Plan memory out)
    {
        uint256 distributable = (cap == 0 || cap > pool) ? pool : cap;
        (uint256[] memory amounts, uint256 remainder) = usage.weights.allocate(distributable);

        uint256 total;
        for (uint256 i; i < amounts.length; ++i) {
            total += amounts[i];
        }
        // Belt and braces on the invariant the demo cannot afford to break:
        // the split can never ask Suite for more than it holds.
        if (total > pool) revert ExceedsPool(total, pool);

        out = Plan({
            recipients: usage.recipients,
            amounts: amounts,
            distributable: distributable,
            total: total,
            remainder: remainder
        });
    }

    function run() external returns (Plan memory out) {
        Suite suite = Suite(_resolveSuite());
        Usage memory usage = loadUsage(vm.envOr("USAGE_FILE", string("script/usage.example.json")));

        uint256 pool = suite.poolBalance();
        out = plan(usage, pool, vm.envOr("DISTRIBUTE_MAX", uint256(0)));

        console2.log("Suite         ", address(suite));
        console2.log("pool balance  ", pool);
        console2.log("distributable ", out.distributable);
        for (uint256 i; i < out.recipients.length; ++i) {
            console2.log("  ->", out.recipients[i], out.amounts[i]);
        }
        console2.log("total out     ", out.total);
        console2.log("carries over  ", pool - out.total);

        vm.startBroadcast();
        suite.distribute(out.recipients, out.amounts);
        vm.stopBroadcast();
    }

    /// @dev SUITE_ADDRESS, else the address the deploy script recorded for this chain.
    function _resolveSuite() internal view returns (address suite) {
        suite = vm.envOr("SUITE_ADDRESS", address(0));
        if (suite != address(0)) return suite;

        string memory path = string.concat("deployments/", vm.toString(block.chainid), ".json");
        if (!vm.exists(path)) revert MissingSuiteAddress();
        suite = vm.parseJsonAddress(vm.readFile(path), ".Suite");
        if (suite == address(0)) revert MissingSuiteAddress();
    }
}

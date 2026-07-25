// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Deploy} from "../script/Deploy.s.sol";
import {Suite} from "../src/Suite.sol";
import {AccessPass} from "../src/AccessPass.sol";
import {KohaRecord} from "../src/KohaRecord.sol";

/// Local proof that the deploy script wires the right owner and settlement
/// token from the environment — so the Fuji run is a formality, not a first
/// attempt. No network, no keys.
contract DeployTest is Test {
    Deploy internal script;

    address internal owner = makeAddr("ownerOracle");
    address internal token = makeAddr("settlementToken");

    function setUp() public {
        script = new Deploy();
    }

    /// One test, three cases: env vars are process-global and forge runs test
    /// functions concurrently, so splitting these would race on SUITE_OWNER.
    function test_LoadConfig_ReadsAndValidatesEnvironment() public {
        vm.setEnv("SETTLEMENT_TOKEN", vm.toString(token));
        vm.setEnv("SUITE_OWNER", vm.toString(owner));
        Deploy.Config memory cfg = script.loadConfig();
        assertEq(cfg.settlementToken, token);
        assertEq(cfg.owner, owner);

        // A missing/unset address must stop the deploy, not deploy a dead pool.
        vm.setEnv("SETTLEMENT_TOKEN", vm.toString(address(0)));
        vm.expectRevert(Deploy.MissingSettlementToken.selector);
        script.loadConfig();

        vm.setEnv("SETTLEMENT_TOKEN", vm.toString(token));
        vm.setEnv("SUITE_OWNER", vm.toString(address(0)));
        vm.expectRevert(Deploy.MissingOwner.selector);
        script.loadConfig();
    }

    function test_Deploy_WiresOwnerAndToken() public {
        Deploy.Deployment memory out =
            script.deploy(Deploy.Config({settlementToken: token, owner: owner}));

        Suite suite = Suite(out.suite);
        AccessPass pass = AccessPass(out.accessPass);
        KohaRecord koha = KohaRecord(out.kohaRecord);

        assertEq(address(suite.settlementToken()), token, "Suite points at the settlement token");
        assertEq(suite.owner(), owner, "owner/oracle owns the pool");
        assertEq(suite.period(), 0);
        assertEq(pass.owner(), owner, "owner/oracle mints passes");
        assertEq(pass.symbol(), "PASS");
        assertEq(koha.owner(), owner, "owner/oracle attests koha");
        assertEq(koha.symbol(), "KOHA");
        assertEq(koha.totalRecorded(), 0);
    }

    /// The env var is the only thing that changes when dNZD replaces USDC.
    function test_Deploy_AcceptsAnySettlementToken() public {
        address dnzdPlaceholder = makeAddr("dnzd");
        Deploy.Deployment memory out =
            script.deploy(Deploy.Config({settlementToken: dnzdPlaceholder, owner: owner}));
        assertEq(address(Suite(out.suite).settlementToken()), dnzdPlaceholder);
    }
}

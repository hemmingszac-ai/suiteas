// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {console2} from "forge-std/console2.sol";
import {Suite} from "../src/Suite.sol";
import {AccessPass} from "../src/AccessPass.sol";
import {KohaRecord} from "../src/KohaRecord.sol";

/// @title Deploy — Suite + AccessPass + KohaRecord.
/// @notice Every address comes from the environment. Nothing is hardcoded here:
/// swapping Fuji USDC for dNZD is a one-variable change (`SETTLEMENT_TOKEN`).
///
/// Required environment:
///   SETTLEMENT_TOKEN  ERC-20 koha settles in (Fuji USDC today, dNZD later)
///   SUITE_OWNER       owner/oracle wallet — owns both contracts, calls distribute
///
/// Dry run (simulate, no broadcast, no artifact written):
///   forge script script/Deploy.s.sol --rpc-url fuji
///
/// Broadcast (signer comes from a keystore account, never from this repo):
///   forge script script/Deploy.s.sol --rpc-url fuji --account suiteas-deployer --broadcast
///
/// Local test of the same wiring: `forge test --match-contract DeployTest`.
contract Deploy is Script {
    /// Chains this script is allowed to touch: Avalanche Fuji and a local node.
    /// Mainnet is a hard stop — see CLAUDE.md.
    uint256 internal constant FUJI = 43113;
    uint256 internal constant ANVIL = 31337;

    struct Config {
        address settlementToken;
        address owner;
    }

    struct Deployment {
        address suite;
        address accessPass;
        address kohaRecord;
    }

    error MissingSettlementToken();
    error MissingOwner();
    error UnsupportedChain(uint256 chainId);

    /// @notice Read + validate deployment config from the environment.
    function loadConfig() public view returns (Config memory cfg) {
        cfg.settlementToken = vm.envOr("SETTLEMENT_TOKEN", address(0));
        cfg.owner = vm.envOr("SUITE_OWNER", address(0));
        if (cfg.settlementToken == address(0)) revert MissingSettlementToken();
        if (cfg.owner == address(0)) revert MissingOwner();
    }

    /// @notice Deploy both contracts. Pure wiring so the local test can call it.
    function deploy(Config memory cfg) public returns (Deployment memory out) {
        Suite suite = new Suite(cfg.settlementToken, cfg.owner);
        AccessPass pass = new AccessPass(cfg.owner);
        KohaRecord koha = new KohaRecord(cfg.owner);
        out = Deployment({
            suite: address(suite),
            accessPass: address(pass),
            kohaRecord: address(koha)
        });
    }

    function run() external returns (Deployment memory out) {
        if (block.chainid != FUJI && block.chainid != ANVIL) {
            revert UnsupportedChain(block.chainid);
        }

        Config memory cfg = loadConfig();

        console2.log("chain            ", block.chainid);
        console2.log("settlement token ", cfg.settlementToken);
        console2.log("owner / oracle   ", cfg.owner);

        vm.startBroadcast();
        out = deploy(cfg);
        vm.stopBroadcast();

        console2.log("Suite            ", out.suite);
        console2.log("AccessPass       ", out.accessPass);
        console2.log("KohaRecord       ", out.kohaRecord);

        _writeArtifact(cfg, out);
    }

    /// @dev Writes deployments/<chainId>.json. `pnpm addresses` merges that into
    /// packages/shared/src/addresses.json — the source of truth the app reads.
    /// Only runs when actually broadcasting, so a dry run leaves no artifact.
    function _writeArtifact(Config memory cfg, Deployment memory out) internal {
        if (!vm.isContext(VmSafe.ForgeContext.ScriptBroadcast)) {
            console2.log("dry run - no deployment artifact written");
            return;
        }
        string memory obj = "deployment";
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "Suite", out.suite);
        vm.serializeAddress(obj, "AccessPass", out.accessPass);
        vm.serializeAddress(obj, "KohaRecord", out.kohaRecord);
        string memory json = vm.serializeAddress(obj, "SettlementToken", cfg.settlementToken);
        string memory path = string.concat("deployments/", vm.toString(block.chainid), ".json");
        vm.writeJson(json, path);
        console2.log("wrote", path);
    }
}

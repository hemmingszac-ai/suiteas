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

        if (vm.isContext(VmSafe.ForgeContext.ScriptBroadcast)) {
            console2.log("");
            console2.log("Now run `pnpm addresses` from the repo root to record these.");
            console2.log("The addresses above are SIMULATED - see the note below.");
        } else {
            console2.log("dry run - nothing broadcast");
        }
    }

    /// @dev This script deliberately does NOT write deployments/<chainId>.json.
    ///
    /// It used to, using the addresses from its own simulation, and that is unsafe
    /// under `--resume`. A resumed run re-simulates the script to rebuild the
    /// transaction list, but starts from current on-chain state where the sender's
    /// nonce has already advanced past the transactions that landed. CREATE
    /// addresses derive from sender + nonce, so every `new Foo()` predicts the
    /// next slot and the whole record shifts by however many transactions already
    /// went through.
    ///
    /// It bit us on the 2026-07-25 Fuji deploy: the first attempt timed out after
    /// Suite was mined, the resumed run re-simulated from nonce 1, and the artifact
    /// was rewritten as Suite=<AccessPass's address>, AccessPass=<KohaRecord's
    /// address>, KohaRecord=<an address with no code>. Since X402_PAY_TO is the
    /// Suite address, koha would have settled into AccessPass — an ERC-721 with no
    /// way to move an ERC-20 out, so the funds would have been unrecoverable.
    ///
    /// `vm.isContext(ScriptBroadcast)` does not help: a resumed run is still a
    /// broadcast context, so the guard passes and writes bad data.
    ///
    /// The record is now built by `scripts/sync-addresses.mjs` (`pnpm addresses`)
    /// from `broadcast/Deploy.s.sol/<chainId>/run-latest.json`. Receipt addresses
    /// are what the chain actually created, so they cannot shift, and that script
    /// additionally refuses any address with no bytecode.
}

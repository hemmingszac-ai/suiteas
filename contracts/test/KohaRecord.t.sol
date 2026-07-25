// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {KohaRecord} from "../src/KohaRecord.sol";
import {AccessPass} from "../src/AccessPass.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Exposes the internal burn so the never-burns guard can be tested at all.
/// KohaRecord itself has no burn path; this proves {_update} blocks one even if a
/// future edit added it.
contract BurnableKohaRecord is KohaRecord {
    constructor(address owner_) KohaRecord(owner_) {}

    function burn(uint256 tokenId) external {
        _burn(tokenId);
    }
}

contract KohaRecordTest is Test {
    KohaRecord internal koha;

    address internal owner = makeAddr("owner");
    address internal giver = makeAddr("giver");
    address internal other = makeAddr("other");

    function setUp() public {
        koha = new KohaRecord(owner);
    }

    function test_Record_OpensRecordOnFirstKoha() public {
        vm.prank(owner);
        uint256 id = koha.record(giver, 1_000_000);

        assertEq(koha.ownerOf(id), giver);
        assertTrue(koha.hasRecord(giver));
        assertEq(koha.recordOf(giver), id);
        assertEq(koha.totalGiven(giver), 1_000_000);
        assertEq(koha.kohaCount(giver), 1);
        assertEq(koha.giverCount(), 1);
        assertEq(koha.totalRecorded(), 1_000_000);
    }

    /// INVARIANT: zero-amount koha must succeed. Zero-payers still get access, so
    /// their giving is still recorded. This is the thesis, not an edge case.
    function test_Record_ZeroAmountSucceeds() public {
        vm.prank(owner);
        uint256 id = koha.record(giver, 0);

        assertEq(koha.ownerOf(id), giver);
        assertTrue(koha.hasRecord(giver));
        assertEq(koha.totalGiven(giver), 0);
        assertEq(koha.kohaCount(giver), 1, "a zero koha still counts as giving");
    }

    /// One record per giver; further koha accumulates onto the same token.
    function test_Record_AccumulatesOnOneToken() public {
        vm.startPrank(owner);
        uint256 id1 = koha.record(giver, 400);
        uint256 id2 = koha.record(giver, 0);
        uint256 id3 = koha.record(giver, 600);
        vm.stopPrank();

        assertEq(id1, id2);
        assertEq(id2, id3);
        assertEq(koha.totalGiven(giver), 1000);
        assertEq(koha.kohaCount(giver), 3);
        assertEq(koha.giverCount(), 1, "same giver is not counted twice");
        assertEq(koha.totalRecorded(), 1000);
    }

    function test_Record_OnlyOwner() public {
        vm.prank(giver);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, giver));
        koha.record(giver, 100);
    }

    function test_Record_RejectsZeroGiver() public {
        vm.prank(owner);
        vm.expectRevert(KohaRecord.ZeroGiver.selector);
        koha.record(address(0), 100);
    }

    function test_RecordMany_AttestsAPeriod() public {
        address[] memory givers = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        (givers[0], givers[1]) = (giver, other);
        (amounts[0], amounts[1]) = (750, 0); // second is a zero-payer

        vm.prank(owner);
        koha.recordMany(givers, amounts);

        assertEq(koha.totalGiven(giver), 750);
        assertEq(koha.totalGiven(other), 0);
        assertTrue(koha.hasRecord(other), "zero-payer still gets a record");
        assertEq(koha.giverCount(), 2);
        assertEq(koha.totalRecorded(), 750);
    }

    function test_RecordMany_LengthMismatch() public {
        address[] memory givers = new address[](2);
        uint256[] memory amounts = new uint256[](1);
        givers[0] = giver;
        givers[1] = other;

        vm.prank(owner);
        vm.expectRevert(KohaRecord.LengthMismatch.selector);
        koha.recordMany(givers, amounts);
    }

    /// Soulbound: the record cannot be sold or moved off the wallet that earned it.
    function test_Soulbound_TransferReverts() public {
        vm.prank(owner);
        uint256 id = koha.record(giver, 100);

        vm.prank(giver);
        vm.expectRevert(KohaRecord.Soulbound.selector);
        koha.transferFrom(giver, other, id);
    }

    /// INVARIANT: KohaRecord never burns. There is no burn path on the contract —
    /// this reaches past that and proves the guard itself rejects a burn.
    function test_NeverBurns_GuardRejectsBurn() public {
        BurnableKohaRecord burnable = new BurnableKohaRecord(owner);
        vm.prank(owner);
        uint256 id = burnable.record(giver, 100);

        vm.expectRevert(KohaRecord.NeverBurns.selector);
        burnable.burn(id);

        assertEq(burnable.ownerOf(id), giver, "record still stands");
    }

    /// INVARIANT (the one CLAUDE.md names): the giving record survives an
    /// AccessPass burn. Membership lapses; the history does not. This is what makes
    /// the record portable — a lapsed member keeps what they gave.
    function test_RecordSurvivesAccessPassBurn() public {
        AccessPass pass = new AccessPass(owner);

        vm.startPrank(owner);
        uint256 passId = pass.mint(giver);
        uint256 kohaId = koha.record(giver, 2_500_000);

        pass.burnFor(giver); // the member lapses
        vm.stopPrank();

        // Credential is gone.
        assertFalse(pass.hasPass(giver));
        assertEq(pass.passOf(giver), 0);

        // History is untouched.
        assertTrue(koha.hasRecord(giver), "KohaRecord must outlive the AccessPass");
        assertEq(koha.ownerOf(kohaId), giver);
        assertEq(koha.totalGiven(giver), 2_500_000);
        assertEq(koha.kohaCount(giver), 1);

        // And they can re-subscribe onto the same record.
        vm.startPrank(owner);
        uint256 passId2 = pass.mint(giver);
        koha.record(giver, 500_000);
        vm.stopPrank();

        assertTrue(passId2 != passId, "a new credential");
        assertEq(koha.recordOf(giver), kohaId, "the same permanent record");
        assertEq(koha.totalGiven(giver), 3_000_000);
    }
}

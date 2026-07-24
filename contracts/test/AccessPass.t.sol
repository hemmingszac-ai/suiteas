// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AccessPass} from "../src/AccessPass.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract AccessPassTest is Test {
    AccessPass internal pass;

    address internal owner = makeAddr("owner");
    address internal member = makeAddr("member");
    address internal other = makeAddr("other");

    function setUp() public {
        pass = new AccessPass(owner);
    }

    function test_Mint_GivesPass() public {
        vm.prank(owner);
        uint256 id = pass.mint(member);

        assertEq(pass.ownerOf(id), member);
        assertTrue(pass.hasPass(member));
        assertEq(pass.passOf(member), id);
    }

    function test_Mint_OnePerAddress() public {
        vm.startPrank(owner);
        pass.mint(member);
        vm.expectRevert(AccessPass.AlreadyHasPass.selector);
        pass.mint(member);
        vm.stopPrank();
    }

    function test_Mint_OnlyOwner() public {
        vm.prank(member);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, member));
        pass.mint(member);
    }

    /// Soulbound: the credential cannot be transferred away.
    function test_Soulbound_TransferReverts() public {
        vm.prank(owner);
        uint256 id = pass.mint(member);

        vm.prank(member);
        vm.expectRevert(AccessPass.Soulbound.selector);
        pass.transferFrom(member, other, id);
    }

    /// AccessPass CAN burn (unlike KohaRecord). Lapse removes the credential.
    function test_Burn_RemovesPass() public {
        vm.startPrank(owner);
        uint256 id = pass.mint(member);
        pass.burnFor(member);
        vm.stopPrank();

        assertFalse(pass.hasPass(member));
        assertEq(pass.passOf(member), 0);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, id));
        pass.ownerOf(id);
    }

    function test_Burn_RevertsWithoutPass() public {
        vm.prank(owner);
        vm.expectRevert(AccessPass.NoPass.selector);
        pass.burnFor(member);
    }

    /// After a burn the member can be re-issued a pass (re-subscribe).
    function test_ReMint_AfterBurn() public {
        vm.startPrank(owner);
        pass.mint(member);
        pass.burnFor(member);
        uint256 id2 = pass.mint(member);
        vm.stopPrank();

        assertTrue(pass.hasPass(member));
        assertEq(pass.ownerOf(id2), member);
    }
}

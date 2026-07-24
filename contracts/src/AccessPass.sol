// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AccessPass — soulbound membership credential.
/// @notice Your identity in the bundle. One non-transferable pass per member,
/// bound to your wallet: it proves membership and access without exposing any
/// personal data, and it cannot be sold or moved. This is the "modern, secure,
/// intuitive digital identity" — you are identified by holding the pass, not by
/// handing over personal details.
///
/// Burns on lapse. The permanent giving history lives in KohaRecord (invariant:
/// that never burns); this credential is the thing that lapses.
contract AccessPass is ERC721, Ownable {
    uint256 private _nextId = 1;

    /// @notice holder => tokenId (0 = no pass).
    mapping(address => uint256) public passOf;

    error Soulbound();
    error AlreadyHasPass();
    error NoPass();

    event Minted(address indexed holder, uint256 indexed tokenId);
    event Burned(address indexed holder, uint256 indexed tokenId);

    constructor(address owner_) ERC721("Suiteas AccessPass", "PASS") Ownable(owner_) {}

    function hasPass(address who) external view returns (bool) {
        return passOf[who] != 0;
    }

    /// @notice Issue a member their pass. One per address.
    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        if (passOf[to] != 0) revert AlreadyHasPass();
        tokenId = _nextId++;
        passOf[to] = tokenId;
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
    }

    /// @notice Burn a lapsed member's pass. AccessPass can burn; KohaRecord never does.
    function burnFor(address holder) external onlyOwner {
        uint256 tokenId = passOf[holder];
        if (tokenId == 0) revert NoPass();
        delete passOf[holder];
        _burn(tokenId);
        emit Burned(holder, tokenId);
    }

    /// @dev Soulbound: allow mint (from == 0) and burn (to == 0), block transfers.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }
}

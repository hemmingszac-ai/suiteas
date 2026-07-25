// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title KohaRecord — the permanent record of what you gave.
/// @notice Soulbound, one per giver, and it **never burns**. AccessPass is the
/// credential that lapses; this is the history that does not. If both burned, a
/// lapsed member would lose their giving history and the portability pitch dies —
/// so the burn path is blocked in {_update} rather than merely left unimplemented.
///
/// Amount is not a claim on the pool and confers no ownership. It is a statement
/// of contribution you can carry to another bundle: "I gave this much, this often."
/// A zero-amount koha is a first-class record — paying nothing still counts as
/// participating, which is the thesis, not an edge case.
///
/// Like {Suite}, this contract cannot observe koha itself: x402 relays EIP-3009
/// `transferWithAuthorization`, which has no recipient callback. The owner (the
/// oracle wallet) attests each koha by calling {record}. Same off-chain trust
/// model as `Suite.distribute` — disclosed, not hidden.
contract KohaRecord is ERC721, Ownable {
    uint256 private _nextId = 1;

    /// @notice giver => tokenId (0 = no record yet).
    mapping(address => uint256) public recordOf;

    /// @notice giver => lifetime koha in the settlement token's atomic units.
    mapping(address => uint256) public totalGiven;

    /// @notice giver => how many times they gave (zero-amount koha included).
    mapping(address => uint256) public kohaCount;

    /// @notice Lifetime koha across every giver. The collective's headline figure.
    uint256 public totalRecorded;

    /// @notice How many distinct givers hold a record.
    uint256 public giverCount;

    error Soulbound();
    /// @dev Invariant: KohaRecord never burns.
    error NeverBurns();
    error LengthMismatch();
    error ZeroGiver();

    event Opened(address indexed giver, uint256 indexed tokenId);
    event Koha(address indexed giver, uint256 indexed tokenId, uint256 amount, uint256 newTotal);

    constructor(address owner_) ERC721("Suiteas KohaRecord", "KOHA") Ownable(owner_) {}

    function hasRecord(address who) external view returns (bool) {
        return recordOf[who] != 0;
    }

    /// @notice Attest one koha. Opens the giver's record on their first one.
    /// @dev `amount` of 0 is valid and must not revert — zero-payers still get
    /// access, so their giving is still recorded.
    function record(address giver, uint256 amount) public onlyOwner returns (uint256 tokenId) {
        if (giver == address(0)) revert ZeroGiver();

        tokenId = recordOf[giver];
        if (tokenId == 0) {
            tokenId = _nextId++;
            recordOf[giver] = tokenId;
            ++giverCount;
            _safeMint(giver, tokenId);
            emit Opened(giver, tokenId);
        }

        uint256 newTotal = totalGiven[giver] + amount;
        totalGiven[giver] = newTotal;
        ++kohaCount[giver];
        totalRecorded += amount;

        emit Koha(giver, tokenId, amount, newTotal);
    }

    /// @notice Attest a period's koha in one transaction. Mirrors the parallel-array
    /// shape of `Suite.distribute` so the oracle scripts read the same way.
    function recordMany(address[] calldata givers, uint256[] calldata amounts) external onlyOwner {
        if (givers.length != amounts.length) revert LengthMismatch();
        for (uint256 i; i < givers.length; ++i) {
            record(givers[i], amounts[i]);
        }
    }

    /// @dev Soulbound and unburnable: allow mint (`from == 0`), block everything
    /// else. `to == 0` is a burn, which this contract must never permit.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0)) {
            if (to == address(0)) revert NeverBurns();
            revert Soulbound();
        }
        return super._update(to, tokenId, auth);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Suite — the shared pool.
/// @notice x402 settles USDC into this contract; this address is the x402 `payTo`.
///
/// The contract intentionally has NO deposit function. EIP-3009
/// `transferWithAuthorization` (what x402 facilitators relay) has no recipient
/// callback, so the contract cannot observe individual koha payments on-chain.
/// It is therefore a dumb pot: usage is metered off-chain and the owner (the
/// oracle wallet) calls {distribute} with the computed split.
///
/// Minimal by design for the hackathon. AccessPass / KohaRecord are separate
/// concerns and are not required for the core split demo.
contract Suite is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;

    /// @notice Increments on each split. A label for events, not an accounting ledger.
    uint256 public period;

    event Distributed(uint256 indexed period, address indexed to, uint256 amount);

    error LengthMismatch();
    error ExceedsPool(uint256 requested, uint256 available);

    constructor(address usdc_, address owner_) Ownable(owner_) {
        usdc = IERC20(usdc_);
    }

    /// @notice USDC currently pooled. Poll this for the live counter.
    function poolBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    /// @notice Split the pool to members by off-chain-metered amounts.
    /// @dev Invariant (no wei lost): sum(amounts) must be <= the pool balance;
    /// any remainder stays in the contract for the next period, so USDC is never
    /// stranded or over-spent. Zero amounts are allowed — a member with no usage
    /// this period simply receives nothing, which must not revert.
    function distribute(address[] calldata recipients, uint256[] calldata amounts)
        external
        onlyOwner
    {
        if (recipients.length != amounts.length) revert LengthMismatch();

        uint256 total;
        for (uint256 i; i < amounts.length; ++i) {
            total += amounts[i];
        }

        uint256 available = usdc.balanceOf(address(this));
        if (total > available) revert ExceedsPool(total, available);

        uint256 p = ++period;
        for (uint256 i; i < recipients.length; ++i) {
            uint256 amt = amounts[i];
            if (amt > 0) {
                usdc.safeTransfer(recipients[i], amt);
            }
            emit Distributed(p, recipients[i], amt);
        }
    }
}

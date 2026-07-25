// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title UsageSplit — pro-rata allocation from off-chain usage weights.
/// @notice Metering is off-chain (disclosed, not hidden — see ARCHITECTURE.md).
/// This is the arithmetic that turns seeded usage numbers into the `amounts`
/// array handed to {Suite-distribute}.
///
/// Two properties the demo depends on:
///  - the total allocated is NEVER more than what is distributable (floor
///    division only; the shortfall is returned as `remainder` and stays pooled
///    for the next period, so no value is lost);
///  - a member with zero usage gets a zero allocation rather than a revert.
library UsageSplit {
    /// @param weights Off-chain usage per recipient, in any consistent unit.
    /// @param distributable Atomic units of the settlement token available to split.
    /// @return amounts Allocation per recipient, same order as `weights`.
    /// @return remainder distributable - sum(amounts). Carries to the next period.
    /// @dev Reverts on overflow of `weights[i] * distributable`, which at demo
    /// scale means bad input rather than a real split.
    function allocate(uint256[] memory weights, uint256 distributable)
        internal
        pure
        returns (uint256[] memory amounts, uint256 remainder)
    {
        amounts = new uint256[](weights.length);

        uint256 totalWeight;
        for (uint256 i; i < weights.length; ++i) {
            totalWeight += weights[i];
        }

        // Nobody used anything (or there is nothing to split): every allocation
        // is zero and the whole pool carries forward. Must not revert.
        if (totalWeight == 0 || distributable == 0) {
            return (amounts, distributable);
        }

        uint256 allocated;
        for (uint256 i; i < weights.length; ++i) {
            uint256 amount = (weights[i] * distributable) / totalWeight;
            amounts[i] = amount;
            allocated += amount;
        }

        remainder = distributable - allocated;
    }
}

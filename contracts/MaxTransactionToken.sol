// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./BlackListToken.sol";

abstract contract MaxTransactionToken is BlacklistToken {
    mapping(address => bool) private _excludedFromMaxTransaction;

    // No minimum can be used to stop all transaction
    uint256 private _maxTransactionAmount = MAX_TX;

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        if (
            !_excludedFromMaxTransaction[sender] &&
            !_excludedFromMaxTransaction[recipient]
        ) {
            require(
                amount <= _maxTransactionAmount,
                "MaxTransactionToken: amount exceeds max transaction amount"
            );
        }
        super._transfer(sender, recipient, amount);
    }

    function setMaxTransactionAmount(uint256 amount) external onlyAdmin {
        _maxTransactionAmount = amount;
    }

    function maxTransactionAmount() external view returns (uint256) {
        return _maxTransactionAmount;
    }

    function addToExemptedFromMaxTx(address account) external onlyAdmin {
        _excludedFromMaxTransaction[account] = true;
    }

    function removeFromExemptedMaxTx(address account) external onlyAdmin {
        require(
            _excludedFromMaxTransaction[account],
            "MaxTransactionToken: account is not exempted"
        );
        _excludedFromMaxTransaction[account] = false;
    }

    function isExemptedFromMaxTx(address account) external view returns (bool) {
        return _excludedFromMaxTransaction[account];
    }

    function _exemptFromMaxTx(address account) internal {
        _excludedFromMaxTransaction[account] = true;
    }
}

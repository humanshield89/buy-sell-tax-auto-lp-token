// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MaxTransactionToken.sol";

abstract contract MaxWalletToken is MaxTransactionToken {
    uint256 private _maxWalletAmount = MAX_WALLET;
    mapping(address => bool) private _excludedFromMaxWallet;

    function isExemptedFromMaxWallet(address account)
        external
        view
        returns (bool)
    {
        return _excludedFromMaxWallet[account];
    }

    function setMaxWalletAmount(uint256 amount) external onlyAdmin {
        _maxWalletAmount = amount;
    }

    function exemptFromMaxWallet(address account) external onlyAdmin {
        _exemptFromMaxWallet(account);
    }

    function maxWalletAmount() external view returns (uint256) {
        return _maxWalletAmount;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(
            _excludedFromMaxWallet[recipient] ||
                (balanceOf(recipient) + amount) <= _maxWalletAmount,
            "MaxWalletToken: wallet exceeds max wallet amount"
        );
        super._transfer(sender, recipient, amount);
    }

    function _exemptFromMaxWallet(address account) internal {
        _excludedFromMaxWallet[account] = true;
    }

    function removeExemptFromMaxWallet(address account) external onlyAdmin {
        _excludedFromMaxWallet[account] = false;
    }
}

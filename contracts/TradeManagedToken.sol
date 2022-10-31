// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MaxWalletToken.sol";

abstract contract TradeManagedToken is MaxWalletToken {
    bool private _trading = true;

    function isTrading() external view returns (bool) {
        return _trading;
    }

    function setTrading(bool trading) external onlyAdmin {
        _trading = trading;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(
            _trading || isAdmin(sender),
            "TradeManagedToken: trading is not enabled"
        );
        super._transfer(sender, recipient, amount);
    }
}

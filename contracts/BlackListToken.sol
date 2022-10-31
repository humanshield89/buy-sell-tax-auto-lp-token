// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./AccessControl.sol";

abstract contract BlacklistToken is ERC20, AccessControl {
    mapping(address => bool) private _blacklist;

    function addToBlacklist(address account) external onlyAdmin {
        _blacklist[account] = true;
    }

    function removeFromBlacklist(address account) external onlyAdmin {
        _blacklist[account] = false;
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(!_blacklist[sender], "BlacklistToken: sender is blacklisted");
        require(
            !_blacklist[recipient],
            "BlacklistToken: recipient is blacklisted"
        );
        super._transfer(sender, recipient, amount);
    }
}

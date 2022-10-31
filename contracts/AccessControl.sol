// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./data/constants.sol";

contract AccessControl is Ownable {
    mapping(address => bool) private _admins;

    constructor() {
        _admins[_msgSender()] = true;
    }

    modifier onlyAdmin() {
        require(_admins[_msgSender()], "AccessControl: caller is not an admin");
        _;
    }

    function addAdmin(address account) external onlyOwner {
        _admins[account] = true;
    }

    function _addAdmin(address account) internal {
        _admins[account] = true;
    }

    function removeAdmin(address account) external onlyOwner {
        _admins[account] = false;
    }

    function renounceAdminship() external onlyAdmin {
        _admins[_msgSender()] = false;
    }

    function isAdmin(address account) public view returns (bool) {
        return _admins[account];
    }
}

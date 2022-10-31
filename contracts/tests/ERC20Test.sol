// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "../TradeManagedToken.sol";

contract ERC20Test is TradeManagedToken {
    constructor() ERC20("name", "symbol") {
        _mint(msg.sender, 100000000000000000000000000);
    }
}

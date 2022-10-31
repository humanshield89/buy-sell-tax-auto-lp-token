// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

uint16 constant DECIMALS = 18;
uint256 constant MAX_TX = 100_000 * 10**DECIMALS;
uint256 constant MAX_WALLET = 1_000_000 * 10**DECIMALS;
string constant TOKEN_NAME = "Token";
string constant TOKEN_SYMBOL = "TKN";
uint256 constant TOTAL_SUPPLY = 500_000_000;

// tax
uint16 constant DENOMINATOR = 10000;
uint16 constant MAX_FEE = 1000; // 10%
uint16 constant BUY_FEE = 600; // 6%
uint16 constant ADMIN_SELL_FEE = 300; // 3%
uint16 constant MARKETING_SELL_FEE = 300; // 3%
address constant ADMIN_WALLET = 0x3e61faF390050452272Ac5b94931B0c075556CdA;
address constant MARKETING_WALLET = 0x3e61faF390050452272Ac5b94931B0c075556CdA;

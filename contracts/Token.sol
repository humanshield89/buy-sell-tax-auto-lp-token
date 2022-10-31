// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./internface/IFactory.sol";
import "./internface/IRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TradeManagedToken.sol";
import "hardhat/console.sol";

struct Fees {
    uint64 BuyFee; // 8
    uint64 marketingFee; // 8 bytes
    uint128 adminFee; // bytes
}

contract Token is TradeManagedToken {
    using SafeERC20 for IERC20;

    IERC20 public immutable wrappedNativeToken;
    IFactory public immutable factory;
    address public immutable lpPair;
    IRouter public immutable router;

    Fees fees = Fees(BUY_FEE, MARKETING_SELL_FEE, ADMIN_SELL_FEE);

    mapping(address => bool) public lpPairList;

    mapping(address => bool) public isExcludedFromFee;

    uint256 public liquidityReseves;
    uint256 public adminReserves;
    uint256 public marketingReserves;

    address public adminWallet = ADMIN_WALLET;
    address public marketingWallet = MARKETING_WALLET;

    bool public isSwapEnabled = true;
    bool public taxEnabled = true;

    constructor(
        IERC20 _wrappedNativeToken,
        IFactory _factory,
        IRouter _router
    ) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
        wrappedNativeToken = _wrappedNativeToken;
        factory = _factory;
        router = _router;

        _exemptFromMaxWallet(_msgSender());
        _exemptFromMaxTx(_msgSender());
        isExcludedFromFee[_msgSender()] = true;

        isExcludedFromFee[address(this)] = true;
        _exemptFromMaxWallet(address(this));
        _exemptFromMaxTx(address(this));
        _addAdmin(address(this));

        lpPair = factory.createPair(
            address(_wrappedNativeToken),
            address(this)
        );
        lpPairList[lpPair] = true;
        // mint total supply
        _mint(_msgSender(), TOTAL_SUPPLY * 10**DECIMALS);

        _approve(address(this), address(router), type(uint256).max);
    }

    receive() external payable {
        require(
            msg.sender == address(router),
            "Token: only router can send native tokens"
        );
    }

    function processReserves() external {
        _processReserves(true);
    }

    function setSwapEnabled(bool _isSwapEnabled) external onlyAdmin {
        isSwapEnabled = _isSwapEnabled;
    }

    function setFees(
        uint64 _buyFee,
        uint64 _marketingFee,
        uint128 _adminFee
    ) external onlyAdmin {
        require(
            _buyFee <= MAX_FEE && _adminFee + _marketingFee <= MAX_FEE,
            "Token: fees are too high"
        );
        fees = Fees(_buyFee, _marketingFee, _adminFee);
    }

    function excemptFromFees(address _account, bool _exempt)
        external
        onlyAdmin
    {
        isExcludedFromFee[_account] = _exempt;
    }

    function setTaxEnabled(bool _taxEnabled) external onlyOwner {
        taxEnabled = _taxEnabled;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _approve(
            sender,
            _msgSender(),
            allowance(sender, _msgSender()) - amount
        );
        return _customTransfer(sender, recipient, amount);
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        return _customTransfer(_msgSender(), recipient, amount);
    }

    function _customTransfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        // check if this is a sale or a buy
        bool isBuy = lpPairList[sender];
        bool isSell = lpPairList[recipient];

        if (sender != lpPair && recipient != lpPair) {
            // we can make swaps and add liquitity
            _processReserves(isSwapEnabled);
        }

        if (
            (!isBuy && !isSell) ||
            (isBuy && isExcludedFromFee[recipient]) ||
            (isSell && isExcludedFromFee[sender]) ||
            !taxEnabled
        ) {
            super._transfer(sender, recipient, amount);
            return true;
        } else if (isBuy) {
            // this is a buy excute it
            uint256 buyFeeAmount = (amount * fees.BuyFee) / DENOMINATOR;
            uint256 left = amount - buyFeeAmount;

            super._transfer(sender, recipient, left);
            super._transfer(sender, address(this), buyFeeAmount);
            liquidityReseves += buyFeeAmount;
        } else if (isSell) {
            // this is a sell excute it
            uint256 adminFeeAmount = (amount * fees.adminFee) / DENOMINATOR;
            uint256 marketingFeeAmount = (amount * fees.marketingFee) /
                DENOMINATOR;
            uint256 left = amount - adminFeeAmount - marketingFeeAmount;
            super._transfer(sender, recipient, left);
            super._transfer(
                sender,
                address(this),
                adminFeeAmount + marketingFeeAmount
            );
            adminReserves += adminFeeAmount;
            marketingReserves += marketingFeeAmount;
        }

        return true;
    }

    function _processReserves(bool _isSwapEnabled) internal {
        if (!_isSwapEnabled) return;

        if (adminReserves > 0) {
            _swap(adminReserves, adminWallet);
            adminReserves = 0;
        }
        if (marketingReserves > 0) {
            _swap(marketingReserves, marketingWallet);
            marketingReserves = 0;
        }

        if (liquidityReseves > 0) {
            _swapAndLiquify(liquidityReseves);
            liquidityReseves = 0;
        }
    }

    function _swapAndLiquify(uint256 amount) internal {
        // split the contract balance into halves
        uint256 half = amount / 2;
        uint256 otherHalf = amount - half;

        // swap tokens for ETH
        _swap(half, address(this));

        // add liquidity to uniswap
        router.addLiquidityETH{value: address(this).balance}(
            address(this),
            otherHalf,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            address(this),
            block.timestamp
        );
    }

    function _swap(uint256 amount, address _to) internal {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = address(wrappedNativeToken);
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount,
            0,
            path,
            _to,
            block.timestamp
        );
    }
}

const { expect } = require("chai");

const weth = require("@uniswap/v2-periphery/build/WETH9.json");
const factory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const router = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

describe("Tax Tests", function () {
  it("Deploys correctly", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    this.Token = Token;
    const WETH = await ethers.getContractFactory(weth.abi, weth.bytecode);
    const Factory = await ethers.getContractFactory(
      factory.abi,
      factory.bytecode
    );
    const Router = await ethers.getContractFactory(router.abi, router.bytecode);

    this.weth = await WETH.deploy();
    this.factory = await Factory.deploy(owner.address);
    this.router = await Router.deploy(this.factory.address, this.weth.address);
    /*
        IERC20 _wrappedNativeToken,
        IFactory _factory,
        IRouter _router
    */
    this.token = await Token.deploy(
      this.weth.address,
      this.factory.address,
      this.router.address
    );

    this.token.approve(this.router.address, "1000000000000000000000");

    /*
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    */
    await this.router.addLiquidityETH(
      this.token.address,
      "1000000000000000000000",
      0,
      0,
      owner.address,
      "999999999999999",
      { value: "1000000000000000000" }
    );

    await this.token.transfer(alice.address, "1000000000000000000000");
    expect(await this.token.balanceOf(alice.address)).to.equal(
      "1000000000000000000000"
    );
    await this.token.transfer(bob.address, "1000000000000000000000");
    expect(await this.token.balanceOf(bob.address)).to.equal(
      "1000000000000000000000"
    );
    await this.token.transfer(carl.address, "1000000000000000000000");
    expect(await this.token.balanceOf(carl.address)).to.equal(
      "1000000000000000000000"
    );
  });

  it("should faild to exempt from tax by non admin", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();
    await expect(
      this.token.connect(alice).excemptFromFees(exemptFromTax.address, true)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("should allow admin to exempt user from tax", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();
    await this.token.excemptFromFees(exemptFromTax.address, true);
    expect(await this.token.isExcludedFromFee(exemptFromTax.address)).to.equal(
      true
    );
  });

  it("should tax no tax when exempt user buy token ", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();
    /*
    uint amountOutMin, address[] calldata path, address to, uint deadline
    */
    //     function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    const amountOut = await this.router.getAmountOut(
      "500000000000000000",
      1n * 10n ** 18n,
      1000n * 10n ** 18n
    );

    await this.router
      .connect(exemptFromTax)
      .swapExactETHForTokens(
        0,
        [this.weth.address, this.token.address],
        exemptFromTax.address,
        "999999999999999",
        { value: "500000000000000000" }
      );
    // expected amount out = 33333333333333333334
    expect(await this.token.balanceOf(exemptFromTax.address)).to.equal(
      amountOut
    );
  });

  it("should pay tax when user buy token ", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();

    const reservesOfToken = await this.token.balanceOf(
      await this.token.lpPair()
    );
    const amountOut = await this.router.getAmountOut(
      "500000000000000000",
      1n * 10n ** 18n + 500000000000000000n,
      reservesOfToken
    );
    const balanceBefore = await this.token.balanceOf(alice.address);
    await this.router
      .connect(alice)
      .swapExactETHForTokens(
        0,
        [this.weth.address, this.token.address],
        alice.address,
        "999999999999999",
        { value: "500000000000000000" }
      );
    // expected amount out = 33333333333333333334
    expect(
      (await this.token.balanceOf(alice.address)) - balanceBefore
    ).to.be.closeTo(Number(amountOut * 0.94), 50000);

    // expect the lp reserves to be updated
    const reserves = await this.token.liquidityReseves();
    this.lpReserves = reserves;
    expect(reserves).to.be.closeTo(amountOut.mul(6).div(100), 50000);
  });

  it("should not tax exempt user when he sells", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();

    const reservesOfToken = await this.token.balanceOf(
      await this.token.lpPair()
    );
    const reservesWeth = await this.weth.balanceOf(await this.token.lpPair());
    const amountOut = await this.router.getAmountOut(
      50n * 10n ** 18n,
      reservesOfToken,
      reservesWeth
    );
    //function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
    await this.token
      .connect(exemptFromTax)
      .approve(this.router.address, 50n * 10n ** 18n);
    await this.router
      .connect(exemptFromTax)
      .swapExactTokensForETH(
        50n * 10n ** 18n,
        0,
        [this.token.address, this.weth.address],
        exemptFromTax.address,
        "999999999999999"
      );
    const balanceAfter = await this.token.balanceOf(await this.token.lpPair());

    expect(balanceAfter.sub(reservesOfToken)).to.be.closeTo(
      50n * 10n ** 18n,
      50000
    );
  });

  it("should pay tax on sell", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();

    const reservesOfToken = await this.token.balanceOf(
      await this.token.lpPair()
    );
    const reservesWeth = await this.weth.balanceOf(await this.token.lpPair());

    const amountOut = await this.router.getAmountOut(
      50n * 10n ** 18n,
      reservesOfToken,
      reservesWeth
    );

    await this.token
      .connect(alice)
      .approve(this.router.address, 50n * 10n ** 18n);
    await this.router
      .connect(alice)
      .swapExactTokensForETHSupportingFeeOnTransferTokens(
        50n * 10n ** 18n,
        0,
        [this.token.address, this.weth.address],
        alice.address,
        "999999999999999"
      );

    const balanceAfter = await this.token.balanceOf(await this.token.lpPair());

    expect(balanceAfter.sub(reservesOfToken)).to.be.closeTo(
      (50n * 10n ** 18n * 94n) / 100n,
      50000
    );

    const marketingReserves = await this.token.marketingReserves();
    expect(marketingReserves).to.be.closeTo(
      (50n * 10n ** 18n * 3n) / 100n,
      50000
    );
    const adminReserves = await this.token.adminReserves();
    expect(adminReserves).to.be.closeTo((50n * 10n ** 18n * 3n) / 100n, 50000);

    expect(await this.token.liquidityReseves()).to.be.equal(this.lpReserves);
  });

  it("swaps of transfer", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();

    const adminWallet = await this.token.adminWallet();
    const marketingWallet = await this.token.marketingWallet();

    const adminEthBalance = await ethers.provider.getBalance(adminWallet);
    const marketingEthBalance = await ethers.provider.getBalance(
      marketingWallet
    );

    const lpERC = await this.Token.attach(await this.token.lpPair());

    expect(await lpERC.balanceOf(this.token.address)).to.be.equal(0);

    await this.token.connect(alice).transfer(bob.address, 100n * 10n ** 18n);

    expect(await lpERC.balanceOf(this.token.address)).to.be.not.equal(0);

    const adminEthBalanceAfter = await ethers.provider.getBalance(adminWallet);
    const marketingEthBalanceAfter = await ethers.provider.getBalance(
      marketingWallet
    );

    expect(adminEthBalanceAfter.sub(adminEthBalance)).to.above(0);
    expect(marketingEthBalanceAfter.sub(marketingEthBalance)).to.above(0);

    const liquidityReseves = await this.token.liquidityReseves();
    expect(liquidityReseves).to.be.equal(0);
    const adminReserves = await this.token.adminReserves();
    expect(adminReserves).to.be.equal(0);
    const marketingReserves = await this.token.marketingReserves();
    expect(marketingReserves).to.be.equal(0);
  });

  it("should not pay tax when tax is disabled", async function () {
    const [
      owner,
      admin,
      alice,
      bob,
      carl,
      exemptFromTax,
      exemptFromMaxTx,
      exemptFromMaxWallet,
    ] = await ethers.getSigners();

    await this.token.setTaxEnabled(false);

    expect(await this.token.taxEnabled()).to.be.equal(false);

    const reservesOfToken = await this.token.balanceOf(
      await this.token.lpPair()
    );
    const reservesWeth = await this.weth.balanceOf(await this.token.lpPair());

    const amountOut = await this.router.getAmountOut(
      50n * 10n ** 18n,
      reservesOfToken,
      reservesWeth
    );

    await this.token
      .connect(alice)
      .approve(this.router.address, 50n * 10n ** 18n);
    await this.router
      .connect(alice)
      .swapExactTokensForETHSupportingFeeOnTransferTokens(
        50n * 10n ** 18n,
        0,
        [this.token.address, this.weth.address],
        alice.address,
        "999999999999999"
      );

    const balanceAfter = await this.token.balanceOf(await this.token.lpPair());

    expect(balanceAfter.sub(reservesOfToken)).to.be.equal(50n * 10n ** 18n);
  });
});

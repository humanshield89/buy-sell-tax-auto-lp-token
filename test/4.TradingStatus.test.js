const { expect } = require("chai");

describe("Trade status", function () {
  it("Deploys correctly", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    const TradingStatus = await ethers.getContractFactory("ERC20Test");

    this.tradingStatus = await TradingStatus.deploy();

    await this.tradingStatus.transfer(admin.address, 1000);
    await this.tradingStatus.transfer(admin1.address, 1000);
    await this.tradingStatus.transfer(nonAdmin.address, 1000);
  });

  it("should failt to change trading status by non admin", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    await expect(
      this.tradingStatus.connect(nonAdmin).setTrading(false)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("should allow the admin to change the trading status", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    await this.tradingStatus.setTrading(false);

    expect(await this.tradingStatus.isTrading()).to.equal(false);
  });

  it("should not allow transfer to non admins", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    await expect(
      this.tradingStatus.connect(nonAdmin).transfer(admin.address, 100)
    ).to.be.revertedWith("TradeManagedToken: trading is not enabled");
  });
});

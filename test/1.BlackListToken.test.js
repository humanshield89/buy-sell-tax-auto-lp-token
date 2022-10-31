const { expect } = require("chai");

describe("BlacklistToken", function () {
  it("Deploys correctly", async function () {
    const [owner, blacklisted1, blacklisted2, notBlackListed] =
      await ethers.getSigners();

    const BlacklistToken = await ethers.getContractFactory("ERC20Test");

    this.blacklistToken = await BlacklistToken.deploy();

    await this.blacklistToken.transfer(blacklisted1.address, 1000);
    await this.blacklistToken.transfer(blacklisted2.address, 1000);
    await this.blacklistToken.transfer(notBlackListed.address, 1000);
  });

  it("should add user to blacklist when called by an admin", async function () {
    const [owner, blacklisted1, blacklisted2, notBlackListed] =
      await ethers.getSigners();


    await expect(this.blacklistToken.connect(blacklisted2).addToBlacklist(blacklisted1.address))
    .to.be.revertedWith("AccessControl: caller is not an admin");

    await this.blacklistToken.addToBlacklist(blacklisted1.address);

    expect(
      await this.blacklistToken.isBlacklisted(blacklisted1.address)
    ).to.equal(true);
  });

  it("blacklisted can not transfer", async function () {
    const [owner, blacklisted1, blacklisted2, notBlackListed] =
      await ethers.getSigners();

    await expect(
      this.blacklistToken
        .connect(blacklisted1)
        .transfer(notBlackListed.address, 1000)
    ).to.be.revertedWith("BlacklistToken: sender is blacklisted");

    await expect(
      this.blacklistToken
        .connect(notBlackListed)
        .transfer(blacklisted1.address, 1000)
    ).to.be.revertedWith("BlacklistToken: recipient is blacklisted");
  });

  it("it can remove a blacklisted user", async function () {
    const [owner, blacklisted1, blacklisted2, notBlackListed] =
      await ethers.getSigners();

      await expect(this.blacklistToken.connect(blacklisted2).removeFromBlacklist(blacklisted1.address))
      .to.be.revertedWith("AccessControl: caller is not an admin");

    await this.blacklistToken.removeFromBlacklist(blacklisted1.address);

    expect(
      await this.blacklistToken.isBlacklisted(blacklisted1.address)
    ).to.equal(false);

    expect(
      await this.blacklistToken.balanceOf(notBlackListed.address)
    ).to.equal(1000);

    await this.blacklistToken
      .connect(blacklisted1)
      .transfer(notBlackListed.address, 1000);

    expect(
      await this.blacklistToken.balanceOf(notBlackListed.address)
    ).to.equal(2000);

    await this.blacklistToken
      .connect(notBlackListed)
      .transfer(blacklisted1.address, 1000);

    expect(await this.blacklistToken.balanceOf(blacklisted1.address)).to.equal(
      1000
    );
  });
});

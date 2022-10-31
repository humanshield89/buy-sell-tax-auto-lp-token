const { expect } = require("chai");

describe("Max Wallet", function () {
  it("Deploys correctly", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();

    const MaxWallet = await ethers.getContractFactory("ERC20Test");

    this.maxWallet = await MaxWallet.deploy();

    await this.maxWallet.transfer(exempt1.address, 1000);
    await this.maxWallet.transfer(exempt2.address, 1000);
    await this.maxWallet.transfer(notExempt.address, 1000);
  });

  it("it should fail to change the max wallet", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();
    await expect(
      this.maxWallet.connect(notExempt).setMaxWalletAmount(1500)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("fail to add to exempt by non admin", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();
    await expect(
      this.maxWallet.connect(notExempt).exemptFromMaxWallet(exempt1.address)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("admin can change the maxWallet amount", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();

    await this.maxWallet.setMaxWalletAmount(1500);

    expect(await this.maxWallet.maxWalletAmount()).to.equal(1500);
  });

  it("should allow admin to add user to exempt", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();

    await this.maxWallet.exemptFromMaxWallet(exempt1.address);

    expect(
      await this.maxWallet.isExemptedFromMaxWallet(exempt1.address)
    ).to.equal(true);
  });

  it("should conform to the max wallet", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();

    await expect(
      this.maxWallet.connect(owner).transfer(notExempt.address, 501)
    ).to.be.revertedWith("MaxWalletToken: wallet exceeds max wallet amount");

    await this.maxWallet.connect(owner).transfer(exempt1.address, 501);

    expect(await this.maxWallet.balanceOf(exempt1.address)).to.equal(
      1000 + 501
    );
  });

  it("should fail to remove from exempt by non admin", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();

    await expect(
      this.maxWallet
        .connect(notExempt)
        .removeExemptFromMaxWallet(exempt1.address)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("should allow the admin to remove user from exempt", async function () {
    const [owner, exempt1, exempt2, notExempt] = await ethers.getSigners();

    await this.maxWallet.removeExemptFromMaxWallet(exempt1.address);

    expect(
      await this.maxWallet.isExemptedFromMaxWallet(exempt1.address)
    ).to.equal(false);

    await expect(this.maxWallet.connect(owner).transfer(exempt1.address, 1));
  });
});

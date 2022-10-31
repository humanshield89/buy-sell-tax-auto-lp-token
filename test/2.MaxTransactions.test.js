const { expect } = require("chai");

describe("Max Transaction", function () {
  it("Deploys correctly", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();

    const MaxTransaction = await ethers.getContractFactory("ERC20Test");

    this.maxTransaction = await MaxTransaction.deploy();

    await this.maxTransaction.transfer(exempted1.address, 1000);
    await this.maxTransaction.transfer(notExempt.address, 1000);
  });

  it("shoud fail to change maxTx by non admin", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();

    await expect(
      this.maxTransaction.connect(notExempt).setMaxTransactionAmount(100)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("it fails to exempt from max tx by non admin", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();
    await expect(
      this.maxTransaction
        .connect(notExempt)
        .addToExemptedFromMaxTx(exempted1.address)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("admin can set the max tx", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();

    await this.maxTransaction.setMaxTransactionAmount(100);

    expect(await this.maxTransaction.maxTransactionAmount()).to.equal(100);
  });

  it("should allow admin to exempt from max trasaction", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();

    await this.maxTransaction.addToExemptedFromMaxTx(exempted1.address);

    expect(
      await this.maxTransaction.isExemptedFromMaxTx(exempted1.address)
    ).to.equal(true);
  });

  it("shoud conform to the max transacction", async function () {
    const [owner, exempted1, notExempt, notExempt2] = await ethers.getSigners();

    await this.maxTransaction
      .connect(notExempt)
      .transfer(exempted1.address, 99);
    expect(await this.maxTransaction.balanceOf(notExempt.address)).to.equal(
      1000 - 99
    );
    expect(await this.maxTransaction.balanceOf(exempted1.address)).to.equal(
      1000 + 99
    );

    await expect(
      this.maxTransaction
        .connect(notExempt)
        .transfer(notExempt2.address, 1000 - 99)
    ).to.be.revertedWith(
      "MaxTransactionToken: amount exceeds max transaction amount"
    );
  });

  it("shoud fail to remove exempt by non admin", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();
    await expect(
      this.maxTransaction
        .connect(notExempt)
        .removeFromExemptedMaxTx(exempted1.address)
    ).to.be.revertedWith("AccessControl: caller is not an admin");
  });

  it("removes exempt from max transaction", async function () {
    const [owner, exempted1, notExempt] = await ethers.getSigners();

    await this.maxTransaction.removeFromExemptedMaxTx(exempted1.address);
    expect(
      await this.maxTransaction.isExemptedFromMaxTx(exempted1.address)
    ).to.equal(false);

    await expect(
      this.maxTransaction
        .connect(exempted1)
        .transfer(notExempt.address, 1000 - 99)
    ).to.be.revertedWith(
      "MaxTransactionToken: amount exceeds max transaction amount"
    );
  });
});

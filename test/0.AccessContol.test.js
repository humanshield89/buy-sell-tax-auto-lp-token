const { expect } = require("chai");

describe("Access Control", function () {
  it("Deploys correctly", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    const AccesControl = await ethers.getContractFactory("AccessControl");

    this.accessControl = await AccesControl.deploy();
  });

  it("should set the right owner", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();
    expect(await this.accessControl.owner()).to.equal(owner.address);
  });

  it("expect owner to be an admin", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    expect(await this.accessControl.isAdmin(owner.address)).to.equal(true);
  });

  it("should fail to add admin buy non owner", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();

    await expect(
      this.accessControl.connect(nonAdmin).addAdmin(admin.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should add admin by owner", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();
    await this.accessControl.addAdmin(admin.address);
    expect(await this.accessControl.isAdmin(admin.address)).to.equal(true);
  });

  it("should fail to remove admin by non owner", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();
    await expect(
      this.accessControl.connect(nonAdmin).removeAdmin(admin.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should remove admin by owner", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();
    await this.accessControl.removeAdmin(admin.address);
    expect(await this.accessControl.isAdmin(admin.address)).to.equal(false);
  });

  it("should allow admin to renounce his adminship", async function () {
    const [owner, admin, admin1, nonAdmin] = await ethers.getSigners();
    await this.accessControl.addAdmin(admin1.address);
    await this.accessControl.connect(admin1).renounceAdminship();
    expect(await this.accessControl.isAdmin(admin1.address)).to.equal(false);
  });
});

const config = {
  bscTest: {
    weth: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    factory: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
    router: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
  },
};

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account ETH balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Token");
  /*
    this.weth.address,
    this.factory.address,
    this.router.address
    */
  const token = await Token.deploy(
    config.bscTest.weth,
    config.bscTest.factory,
    config.bscTest.router
  );

  console.log("Token address:", token.address);

  console.log("Verify comand = ");
  console.log(
    "npx hardhat verify --network bscTest " +
      token.address +
      " " +
      config.bscTest.weth +
      " " +
      config.bscTest.factory +
      " " +
      config.bscTest.router
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

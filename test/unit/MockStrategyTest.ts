import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Vault with MockStrategy", function () {
  let vault: Contract;
  let strategy: Contract;
  let token: Contract;
  let controller: Contract;
  let user: any;
  let deployer: any;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    // 1. Deploy TestToken
    const TestTokenFactory = await ethers.getContractFactory("TestToken");
    token = await TestTokenFactory.deploy();
    await token.deployed();

    // Mint to user
    await token.mint(user.address, ethers.utils.parseEther("1000"));

    // 2. Deploy Controller (constructor takes a governance address)
    const Controller = await ethers.getContractFactory("Controller");
    controller = await Controller.deploy(deployer.address);
    await controller.deployed();

    // 3. Deploy Vault (constructor args: want, name, symbol, governance, controller)
    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(
      token.address,
      "My Vault Token",
      "vTOKEN",
      deployer.address,
      controller.address
    );
    await vault.deployed();

    // 4. Deploy MockStrategy
    const MockStrategy = await ethers.getContractFactory("MockStrategy");
    strategy = await MockStrategy.deploy(token.address, controller.address);
    await strategy.deployed();

    // 5. Wire vault + strategy in controller
    await controller.setVault(token.address, vault.address);
    await controller.approveStrategy(token.address, strategy.address);
    await controller.setStrategy(token.address, strategy.address);
  });

  it("should let a user deposit and withdraw", async function () {
    const depositAmount = ethers.utils.parseEther("1000");

    // Approve vault to spend user tokens
    await token.connect(user).approve(vault.address, depositAmount);

    // Deposit
    await vault.connect(user).deposit(depositAmount, user.address);

    expect(await vault.totalAssets()).to.equal(depositAmount);

    // Withdraw
    await vault.connect(user).withdraw(depositAmount, user.address, user.address);

    expect(await token.balanceOf(user.address)).to.equal(depositAmount);
  });
});

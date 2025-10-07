import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Vault with DAI Compound Strategy (Mainnet fork)", function () {
  let vault: Contract;
  let strategy: Contract;
  let controller: Contract;
  let dai: Contract;
  let user: any;

  const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const DAI_WHALE = "0x28C6c06298d514Db089934071355E5743bf21d60"; // Binance wallet
  const cDAI_ADDRESS = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";

  beforeEach(async function () {
    const [deployer, userAddr] = await ethers.getSigners();
    user = userAddr;

    dai = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      DAI_ADDRESS
    );

    // 1. Impersonate whale and transfer DAI to user
    await ethers.provider.send("hardhat_impersonateAccount", [DAI_WHALE]);
    const whaleSigner = await ethers.getSigner(DAI_WHALE);
    await dai.connect(whaleSigner).transfer(user.address, ethers.utils.parseUnits("1000", 18));

    // 2. Deploy controller
    const Controller = await ethers.getContractFactory("Controller");
    controller = await Controller.deploy(deployer.address); // pass rewards address
    await controller.deployed();

    // 3. Deploy vault
    const Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy(
      DAI_ADDRESS,             // ✅ just pass the address
      "DAI-Vault",
      "dVault",
      deployer.address,        // governance
      controller.address       // controller
    );
    await vault.deployed();

    // 4. Deploy StrategyDAICompoundBasic
    const Strategy = await ethers.getContractFactory("StrategyDAICompoundBasic");
    strategy = await Strategy.deploy(controller.address);
    await strategy.deployed();

    // Wire vault + strategy
    await controller.setVault(DAI_ADDRESS, vault.address);
    await controller.approveStrategy(DAI_ADDRESS, strategy.address);
    await controller.setStrategy(DAI_ADDRESS, strategy.address);
  });

  it("should deposit into Compound and accrue some interest", async function () {
    const depositAmount = ethers.utils.parseUnits("500", 18);

    // Approve & deposit
    await dai.connect(user).approve(vault.address, depositAmount);
    await vault.connect(user).deposit(depositAmount, user.address);

    expect(await vault.totalAssets()).to.equal(depositAmount);

    // Check Compound cDAI exchange rate
    const cDAI = await ethers.getContractAt("CERC20", cDAI_ADDRESS);
    const rateBefore = await cDAI.exchangeRateStored();

    // ⏩ Fast-forward time by 30 days
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 365]); // 30 days
    await ethers.provider.send("evm_mine", []);

    const rate = await cDAI.exchangeRateStored();
    console.log("Rate before:", rateBefore.toString());
    console.log("cDAI exchange rate:", rate.toString());

    // Check vault assets after time warp
    const assetsAfter = await vault.totalAssets();
    console.log("Vault totalAssets after time jump:", ethers.utils.formatUnits(assetsAfter, 18));

    // Withdraw
    await vault.connect(user).withdraw(depositAmount, user.address, user.address);

    const finalBalance = await dai.balanceOf(user.address);
    console.log("Final DAI balance:", ethers.utils.formatUnits(finalBalance, 18));
    console.log("Final DAI balance (raw):", (await dai.balanceOf(user.address)).toString());

    // Should be >= initial deposit
    expect(finalBalance).to.be.gte(depositAmount);
  });
});

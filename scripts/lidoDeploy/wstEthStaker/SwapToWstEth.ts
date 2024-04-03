import { ethers, upgrades } from "hardhat";


const deploySwapToWstEthContract = async () => {
  const [owner] = await ethers.getSigners();

  const SwapToWstEth = await ethers.getContractFactory("SwapToWstEth", owner);
  const SwapToWstEthContract = await upgrades.deployProxy(SwapToWstEth, []);
  await SwapToWstEthContract.deployed();

  console.log('SwapToWstEthContract deployed to',SwapToWstEthContract.address)
};

deploySwapToWstEthContract();

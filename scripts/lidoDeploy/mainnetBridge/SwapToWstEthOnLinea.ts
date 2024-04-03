import { ethers, upgrades } from "hardhat";

const L2_RECEPIENT = "0xbA0CeAE2880d8B3efD1d7430549CdDa3B5B82e97";
const deployStakeOnRenzoBridge = async () => {
  const [owner] = await ethers.getSigners();

  const SwapToWstEthOnLinea = await ethers.getContractFactory("SwapToWstEthOnLinea", owner);
  const SwapToWstEthOnLineaContract = await upgrades.deployProxy(SwapToWstEthOnLinea, [L2_RECEPIENT]);
  await SwapToWstEthOnLineaContract.deployed();

  console.log('SwapToWstEthOnLineaContract deployed to',SwapToWstEthOnLineaContract.address)
};

deployStakeOnRenzoBridge();

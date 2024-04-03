/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  SwapToWstEth__factory,
  SwapToWstEth,
  ERC20__factory,
  IWeth__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { expect } from "chai";

const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";
const TOKEN_RECEIVER = "0x29d67419CD9eEB84024b88b9Ca5bA5E6F750B545";
const LINEA_WETH = "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f";
const WST_ETH = "0xB5beDd42000b71FddE22D3eE8a79Bd49A568fC8F";

// Run test with linea hardhat network
describe("Across bridges test", function () {
  let impersonatedSigner: Signer;
  let tokenReceiver: Signer;
  let swapToWstEthOnL2: SwapToWstEth;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);
    tokenReceiver = await ethers.getSigner(TOKEN_RECEIVER);

    swapToWstEthOnL2 = await new SwapToWstEth__factory(impersonatedSigner).deploy();

    await swapToWstEthOnL2.initialize();
  });

  it("Handles swap to wst eth properly", async function () {
    const depositAmount = "2";
    const encodedMessage = ethers.utils.defaultAbiCoder.encode(
      ["address"],
      [TOKEN_RECEIVER]
    );

    await simulateAcrossWethDeposit(
      impersonatedSigner,
      swapToWstEthOnL2.address,
      depositAmount
    );

    const receiverBalBefore = await tokenReceiver.getBalance();

    await swapToWstEthOnL2.handleV3AcrossMessage(
      LINEA_WETH,
      ethers.utils.parseEther(depositAmount),
      ethers.constants.AddressZero,
      encodedMessage
    );

    const receiverBalAfter = await tokenReceiver.getBalance();

    expect(receiverBalAfter.sub(receiverBalBefore)).to.be.eq(
      ethers.utils.parseEther("0.005")
    );        

    // ensure that contract has no stucked ezEth
    expect(
      await getBalance(impersonatedSigner, WST_ETH, swapToWstEthOnL2.address)
    ).eq(0);
    // ensure that contract has no stucked wethEth
    expect(
      await getBalance(impersonatedSigner, LINEA_WETH, swapToWstEthOnL2.address)
    ).eq(0);    
  });
});

async function getWeth(impersonatedSigner: Signer, address: string) {
  return new ethers.Contract(address, IWeth__factory.abi, impersonatedSigner);
}

async function getBalance(
  impersonatedSigner: Signer,
  token: string,
  address: string
) {
  const erc20 = new ethers.Contract(
    token,
    ERC20__factory.abi,
    impersonatedSigner
  );
  return await erc20.balanceOf(address);
}

async function simulateAcrossWethDeposit(
  impersonatedSigner: Signer,
  to: string,
  val: string
) {
  const WETH = await getWeth(impersonatedSigner, LINEA_WETH);

  await WETH.deposit({ value: ethers.utils.parseEther(val) });
  await WETH.transfer(to, ethers.utils.parseEther(val));
}

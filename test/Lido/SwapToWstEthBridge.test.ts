/* eslint-disable */

import {
  impersonateAccount,
  setBalance,
} from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import {
  SwapToWstEthOnLinea,
  SwapToWstEthOnLinea__factory,
} from "../../typechain-types";
import { Signer } from "ethers";
import { expect } from "chai";

const IMPERSONATE_ADDRESS = "0xf4f2b2f9da0546A57DBD01f96Dc7e9956DbA6aFb";

// Run test with Mainnet network at hardhat
describe("StakeOnRenzoBridge test", function () {
  let impersonatedSigner: Signer;
  let swapToWstEthBridge: SwapToWstEthOnLinea;

  beforeEach(async () => {
    await impersonateAccount(IMPERSONATE_ADDRESS);
    setBalance(IMPERSONATE_ADDRESS, 1000 * 10 ** 18);
    impersonatedSigner = await ethers.getSigner(IMPERSONATE_ADDRESS);

    swapToWstEthBridge = await new SwapToWstEthOnLinea__factory(
      impersonatedSigner
    ).deploy();
    //l2 recepient as address(0)
    await swapToWstEthBridge.initialize(ethers.constants.AddressZero);
  });

  it("Allows send crosschain tx via across", async function () {
    const depositAmount = "1";

    await impersonatedSigner.sendTransaction({
      to: swapToWstEthBridge.address,
      value: ethers.utils.parseEther(depositAmount),
    });
    await expect(
      impersonatedSigner.sendTransaction({
        to: swapToWstEthBridge.address,
        value: ethers.utils.parseEther("0.005"),
      })
    ).to.be.revertedWith("Bridging value too low");
  });
  it("Validates input amount", async function () {
    const depositAmount = "0.005";
    await expect(
      impersonatedSigner.sendTransaction({
        to: swapToWstEthBridge.address,
        value: ethers.utils.parseEther(depositAmount),
      })
    ).to.be.revertedWith("Bridging value too low");
  });
});

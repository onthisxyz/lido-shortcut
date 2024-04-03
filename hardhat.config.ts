require("dotenv").config();
import type { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "hardhat-deploy";
import "hardhat-docgen";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_ALCHEMY_KEY}`,
      },
    },
    main: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
    linea: {
      url: `https://linea-mainnet.infura.io/v3/${process.env.LINEA_ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
  contractSizer: {
    runOnCompile: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API,
    customChains: [
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build/",
        },
      },
    ],
  },
};

export default config;

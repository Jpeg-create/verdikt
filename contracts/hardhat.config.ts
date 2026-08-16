import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // X Layer Testnet ("Terigon"), chain id 1952
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC ?? "https://testrpc.xlayer.tech/terigon",
      chainId: 1952,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
    // X Layer Mainnet, chain id 196
    xlayerMainnet: {
      url: process.env.XLAYER_MAINNET_RPC ?? "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

export default config;

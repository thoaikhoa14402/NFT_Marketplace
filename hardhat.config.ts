import "@nomiclabs/hardhat-waffle";
import "@nomicfoundation/hardhat-verify"
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";

const GOERLI_URL = process.env.GOERLI_URL as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY as string;

const config: any = {
  solidity: "0.8.11",
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }
};

export default config;

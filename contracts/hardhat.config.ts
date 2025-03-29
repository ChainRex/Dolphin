import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
import * as dotenv from "dotenv";

dotenv.config();

// Import private key from .env file
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

// Import RPC URLs from .env file
const BSC_TESTNET_URL = process.env.BSC_TESTNET_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/";
const BSC_MAINNET_URL = process.env.BSC_MAINNET_URL || "https://bsc-dataseed.binance.org/";

// Import API keys from .env file
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    bscTestnet: {
      url: BSC_TESTNET_URL,
      accounts: [PRIVATE_KEY],
      chainId: 97,
    },
    bsc: {
      url: BSC_MAINNET_URL,
      accounts: [PRIVATE_KEY],
      chainId: 56,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      bscTestnet: BSCSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;

# Dolphin Contract Deployment Guide for BSC

This document provides a detailed guide for deploying the Dolphin contracts to BSC networks.

## Prerequisites

1. Node.js 16+ and pnpm installed
2. Wallet with BNB for gas fees on the target network
3. RPC endpoints for BSC networks
4. BSCScan API key for contract verification

## Environment Setup

1. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your credentials:
   ```
   PRIVATE_KEY=your_private_key_here (without 0x prefix)
   
   # RPC URLs
   BSC_TESTNET_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
   BSC_MAINNET_URL=https://bsc-dataseed.binance.org/
   
   # API Keys for verification
   BSCSCAN_API_KEY=your_bscscan_api_key
   ```

## Deployment Process

### Local Development Deployment

Start a local Hardhat node in a separate terminal:
```bash
pnpm node
```

In another terminal, deploy to the local node:
```bash
pnpm deploy:localhost
```

### BSC Network Deployment

#### BSC Testnet
```bash
pnpm deploy:bsc-testnet
```

#### BSC Mainnet
```bash
pnpm deploy:bsc
```

### Contract Verification

After deployment, verify the contracts on BSCScan:

```bash
# For BSC Testnet
pnpm verify:bsc-testnet

# For BSC Mainnet
pnpm verify:bsc
```

## Deployment Information

Each deployment saves its information in the `deployments` directory as a JSON file. For example, after deploying to BSC Testnet, you'll find a `bscTestnet.json` file with information like:

```json
{
  "network": "bscTestnet",
  "timestamp": "2023-05-20T15:30:00.000Z",
  "deployer": "0xYourWalletAddress",
  "contracts": {
    "BotNFT": "0xBotNFTContractAddress",
    "MCPServerManager": "0xMCPServerManagerContractAddress",
    "AgentManager": "0xAgentManagerContractAddress"
  }
}
```

## Troubleshooting

### Common Issues

1. **Insufficient Funds**: Ensure your wallet has enough BNB for gas.
   
2. **Nonce Error**: If you get a nonce error, try resetting your account in MetaMask or using the `--reset` flag with Hardhat.

3. **Verification Failures**:
   - Check that your BSCScan API key is correct
   - Ensure the contract was deployed with the exact solc version specified in the hardhat config
   - Make sure all constructor arguments are correct

### Gas Settings for BSC

BSC can sometimes have congestion issues. If you're experiencing transaction failures due to gas issues, you can adjust the gas settings in your `.env` file:

```
GAS_PRICE=5000000000  # 5 Gwei
GAS_MULTIPLIER=1.2
```

### Getting Help

If you encounter issues not covered here, please open an issue on the GitHub repository with detailed information about the error and steps to reproduce. 
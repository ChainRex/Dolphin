# Dolphin Contracts

This project contains Solidity smart contracts for the Dolphin platform, converted from the original Anemone contracts built on Sui Move.

## Deployed Contracts

### BSC Testnet
- **BotNFT**: [0x45ea55087F7CD26273a631E0eD23F90E6BC683f5](https://testnet.bscscan.com/address/0x45ea55087F7CD26273a631E0eD23F90E6BC683f5#code)
- **MCPServerManager**: [0x900C0B558F08F945C58DB139eE030c86538Bb61D](https://testnet.bscscan.com/address/0x900C0B558F08F945C58DB139eE030c86538Bb61D#code)
- **AgentManager**: [0xB0C05112c3801086cE506D1B970B614772AcE409](https://testnet.bscscan.com/address/0xB0C05112c3801086cE506D1B970B614772AcE409#code)

## Contract Overview

- **BotNFT.sol**: ERC721 token representing ownership of Anemone bots
- **AgentManager.sol**: Manages Agent objects that represent autonomous agents with health, servers and balances
- **MCPServerManager.sol**: Manages MCP Server objects that provide functionality to Agents

## Setup

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test
```

## Deployment Guide

### Preparation

1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and fill in your private key and API endpoints:
   ```
   PRIVATE_KEY=your_private_key_here
   BSC_TESTNET_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
   BSC_MAINNET_URL=https://bsc-dataseed.binance.org/
   BSCSCAN_API_KEY=your_bscscan_api_key
   ```

### Deploy to Different Networks

#### Local Development

```bash
# Start a local Hardhat node
pnpm node

# In a separate terminal, deploy to the local node
pnpm deploy:localhost
```

#### BSC Networks Deployment

```bash
# Deploy to BSC Testnet
pnpm deploy:bsc-testnet

# Deploy to BSC Mainnet
pnpm deploy:bsc
```

### Contract Verification

After deployment, you can verify the contracts on BSCScan:

```bash
# Verify on BSC Testnet
pnpm verify:bsc-testnet

# Verify on BSC Mainnet
pnpm verify:bsc
```

## Contract Interactions

### BotNFT

The BotNFT contract is an ERC721 token that represents ownership of a bot. Each bot has the following metadata:
- Name
- Description
- Image URL
- Custom attributes

### AgentManager

The AgentManager contract manages Agent objects. Each Agent has:
- A BotNFT representing ownership
- Health points that decay over time
- A balance in BNB
- A list of enabled MCP Servers
- A bot address that is authorized to interact with it

### MCPServerManager

The MCPServerManager contract allows users to create and manage MCP Servers. Each MCP Server has:
- A name and description
- A endpoint, github repo, and docker image
- A fee for using the server
- A server type (READ_ONLY, BLOCKCHAIN_WRITE, FUND_CUSTODY, INTERNET_WRITE)

## Development

This project uses Hardhat as its development environment.

```bash
# Start a local Hardhat node
npx hardhat node

# Deploy contracts to BSC Testnet
npx hardhat run scripts/deploy-bsc-testnet.ts --network bscTestnet
```

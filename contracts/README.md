# Dolphin Contracts

This project contains Solidity smart contracts for the Dolphin platform, converted from the original Anemone contracts built on Sui Move.

## Contract Overview

- **BotNFT.sol**: ERC721 token representing ownership of Anemone bots
- **AgentManager.sol**: Manages Agent objects that represent autonomous agents with health, servers and balances
- **MCPServerManager.sol**: Manages MCP Server objects that provide functionality to Agents

## Setup

```bash
# Install dependencies
pnpm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts (to localhost network)
npx hardhat run scripts/deploy.ts
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
- A balance in ETH
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

# Deploy contracts to a testnet
npx hardhat run scripts/deploy.ts --network goerli
```

# Deployment Information

This directory contains deployment information for BSC networks. Each file is named after the network (e.g., `bscTestnet.json`, `bsc.json`) and contains the following information:

```json
{
  "network": "network_name",
  "timestamp": "deployment_timestamp",
  "deployer": "deployer_address",
  "contracts": {
    "BotNFT": "bot_nft_contract_address",
    "MCPServerManager": "mcp_server_manager_contract_address",
    "AgentManager": "agent_manager_contract_address"
  }
}
```

## Deployed Contracts

The following table shows the latest deployments:

| Network | BotNFT | MCPServerManager | AgentManager | Deployment Date |
|---------|--------|-----------------|--------------|-----------------|
| BSC Testnet | [0x45ea55087F7CD26273a631E0eD23F90E6BC683f5](https://testnet.bscscan.com/address/0x45ea55087F7CD26273a631E0eD23F90E6BC683f5#code) | [0x900C0B558F08F945C58DB139eE030c86538Bb61D](https://testnet.bscscan.com/address/0x900C0B558F08F945C58DB139eE030c86538Bb61D#code) | [0xB0C05112c3801086cE506D1B970B614772AcE409](https://testnet.bscscan.com/address/0xB0C05112c3801086cE506D1B970B614772AcE409#code) | Mar 29, 2024 |
| BSC Mainnet | - | - | - | - |

## Verification Status

| Network | BotNFT | MCPServerManager | AgentManager |
|---------|--------|-----------------|--------------|
| BSC Testnet | ✅ Verified | ✅ Verified | ✅ Verified |
| BSC Mainnet | - | - | - |

## How to Use

After deploying to a network, the deployment script will automatically update this directory with the deployment information.

You can use the contract addresses in frontends or other applications that need to interact with the deployed contracts.

## Verification

To verify the contracts on BSCScan, run:

```bash
# For BSC Testnet
pnpm verify:bsc-testnet

# For BSC Mainnet
pnpm verify:bsc
``` 
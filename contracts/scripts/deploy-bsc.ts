import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // 确保我们在BSC主网上
  if (network.name !== "bsc") {
    console.error("This script should be run on the BSC Mainnet network!");
    return;
  }

  console.log("Deploying contracts to BSC Mainnet...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Deploy BotNFT
  console.log("Deploying BotNFT...");
  const botNFT = await ethers.deployContract("BotNFT");
  await botNFT.waitForDeployment();
  const botNFTAddress = await botNFT.getAddress();
  console.log(`BotNFT deployed to ${botNFTAddress}`);

  // Deploy MCPServerManager
  console.log("Deploying MCPServerManager...");
  const mcpServerManager = await ethers.deployContract("MCPServerManager");
  await mcpServerManager.waitForDeployment();
  const mcpServerManagerAddress = await mcpServerManager.getAddress();
  console.log(`MCPServerManager deployed to ${mcpServerManagerAddress}`);

  // Deploy AgentManager with botNFT and mcpServerManager addresses
  console.log("Deploying AgentManager...");
  const agentManager = await ethers.deployContract("AgentManager", [botNFTAddress, mcpServerManagerAddress]);
  await agentManager.waitForDeployment();
  const agentManagerAddress = await agentManager.getAddress();
  console.log(`AgentManager deployed to ${agentManagerAddress}`);

  // Store deployment info
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BotNFT: botNFTAddress,
      MCPServerManager: mcpServerManagerAddress,
      AgentManager: agentManagerAddress
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to JSON file
  const filePath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Deployment information saved to", filePath);
  console.log("All contracts deployed successfully!");

  // Log verification commands
  console.log("\nTo verify contracts on BSCScan, run:");
  console.log(`npx hardhat verify --network ${network.name} ${botNFTAddress}`);
  console.log(`npx hardhat verify --network ${network.name} ${mcpServerManagerAddress}`);
  console.log(`npx hardhat verify --network ${network.name} ${agentManagerAddress} ${botNFTAddress} ${mcpServerManagerAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
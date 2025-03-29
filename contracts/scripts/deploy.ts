import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy BotNFT
  const botNFT = await ethers.deployContract("BotNFT");
  await botNFT.waitForDeployment();
  const botNFTAddress = await botNFT.getAddress();
  console.log(`BotNFT deployed to ${botNFTAddress}`);

  // Deploy MCPServerManager
  const mcpServerManager = await ethers.deployContract("MCPServerManager");
  await mcpServerManager.waitForDeployment();
  const mcpServerManagerAddress = await mcpServerManager.getAddress();
  console.log(`MCPServerManager deployed to ${mcpServerManagerAddress}`);

  // Deploy AgentManager with botNFT and mcpServerManager addresses
  const agentManager = await ethers.deployContract("AgentManager", [botNFTAddress, mcpServerManagerAddress]);
  await agentManager.waitForDeployment();
  const agentManagerAddress = await agentManager.getAddress();
  console.log(`AgentManager deployed to ${agentManagerAddress}`);

  console.log("All contracts deployed successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
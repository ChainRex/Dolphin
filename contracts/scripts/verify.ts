import { run, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log(`Starting verification on ${network.name} network...`);

  // Read deployment information
  const deploymentsDir = path.join(__dirname, "../deployments");
  const filePath = path.join(deploymentsDir, `${network.name}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`No deployment found for network: ${network.name}`);
    console.error(`Make sure you've deployed to this network and have a deployment file at: ${filePath}`);
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const { BotNFT, MCPServerManager, AgentManager } = deploymentInfo.contracts;

  console.log("Verifying BotNFT...");
  try {
    await run("verify:verify", {
      address: BotNFT,
      constructorArguments: [],
    });
    console.log("BotNFT verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("BotNFT already verified");
    } else {
      console.error("Error verifying BotNFT:", error);
    }
  }

  console.log("Verifying MCPServerManager...");
  try {
    await run("verify:verify", {
      address: MCPServerManager,
      constructorArguments: [],
    });
    console.log("MCPServerManager verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("MCPServerManager already verified");
    } else {
      console.error("Error verifying MCPServerManager:", error);
    }
  }

  console.log("Verifying AgentManager...");
  try {
    await run("verify:verify", {
      address: AgentManager,
      constructorArguments: [BotNFT, MCPServerManager],
    });
    console.log("AgentManager verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("AgentManager already verified");
    } else {
      console.error("Error verifying AgentManager:", error);
    }
  }

  console.log("Verification complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 
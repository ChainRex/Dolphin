import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  BotNFT, 
  MCPServerManager, 
  AgentManager 
} from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AgentManager", function () {
  let botNFT: BotNFT;
  let mcpServerManager: MCPServerManager;
  let agentManager: AgentManager;
  let owner: HardhatEthersSigner;
  let botAddress: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  beforeEach(async function () {
    // Get signers
    [owner, botAddress, user] = await ethers.getSigners();

    // Deploy BotNFT
    const BotNFTFactory = await ethers.getContractFactory("BotNFT");
    botNFT = await BotNFTFactory.deploy();

    // Deploy MCPServerManager
    const MCPServerManagerFactory = await ethers.getContractFactory("MCPServerManager");
    mcpServerManager = await MCPServerManagerFactory.deploy();

    // Deploy AgentManager
    const AgentManagerFactory = await ethers.getContractFactory("AgentManager");
    agentManager = await AgentManagerFactory.deploy(
      await botNFT.getAddress(),
      await mcpServerManager.getAddress()
    );
  });

  describe("Agent Creation", function () {
    it("Should create a new agent", async function () {
      const initialDeposit = ethers.parseEther("0.1");
      
      await expect(
        agentManager.connect(user).createAgent(
          botAddress.address,
          "Test Bot",
          "A test bot",
          "https://example.com/image.png",
          "app-id-123",
          { value: initialDeposit }
        )
      ).to.emit(agentManager, "AgentCreated");

      // Check that the agent was created
      const agentId = 0; // First agent ID should be 0
      const [
        botNftId,
        health,
        isActive,
        isLocked,
        lastEpoch,
        inactiveEpochs,
        balance,
        botAddressValue,
        mcpServerIds,
        appId
      ] = await agentManager.getAgentDetails(agentId);

      expect(botAddressValue).to.equal(botAddress.address);
      expect(isActive).to.equal(true);
      expect(isLocked).to.equal(false);
      expect(inactiveEpochs).to.equal(0);
      expect(balance).to.equal(initialDeposit);
      expect(mcpServerIds.length).to.equal(0);
      expect(appId).to.equal("app-id-123");
    });
  });

  describe("ETH Operations", function () {
    it("Should allow depositing ETH", async function () {
      // Create an agent first
      const initialDeposit = ethers.parseEther("0.1");
      await agentManager.connect(user).createAgent(
        botAddress.address,
        "Test Bot",
        "A test bot",
        "https://example.com/image.png",
        "app-id-123",
        { value: initialDeposit }
      );

      const agentId = 0;
      const additionalDeposit = ethers.parseEther("0.05");

      await expect(
        agentManager.connect(user).depositEth(agentId, { value: additionalDeposit })
      ).to.emit(agentManager, "DepositReceived")
        .withArgs(agentId, additionalDeposit);

      // Check that the balance was updated
      const [,,,,,, balance,,] = await agentManager.getAgentDetails(agentId);
      expect(balance).to.equal(initialDeposit + additionalDeposit);
    });

    it("Should allow withdrawing ETH", async function () {
      // Create an agent first
      const initialDeposit = ethers.parseEther("0.1");
      await agentManager.connect(user).createAgent(
        botAddress.address,
        "Test Bot",
        "A test bot",
        "https://example.com/image.png",
        "app-id-123",
        { value: initialDeposit }
      );

      const agentId = 0;
      const withdrawAmount = ethers.parseEther("0.05");

      // Bot NFT should have been sent to the user account
      await expect(
        agentManager.connect(user).withdrawEthWithNft(agentId, withdrawAmount)
      ).to.emit(agentManager, "WithdrawalMade")
        .withArgs(agentId, user.address, withdrawAmount);

      // Check that the balance was updated
      const [,,,,,, balance,,] = await agentManager.getAgentDetails(agentId);
      expect(balance).to.equal(initialDeposit - withdrawAmount);
    });
  });

  describe("Agent Status Management", function () {
    it("Should allow deactivating and reactivating an agent", async function () {
      // Create an agent first
      const initialDeposit = ethers.parseEther("0.1");
      await agentManager.connect(user).createAgent(
        botAddress.address,
        "Test Bot",
        "A test bot",
        "https://example.com/image.png",
        "app-id-123",
        { value: initialDeposit }
      );

      const agentId = 0;

      // Deactivate agent
      await expect(
        agentManager.connect(user).deactivateAgent(agentId)
      ).to.emit(agentManager, "AgentStatusChanged")
        .withArgs(agentId, false);

      // Check that the agent is inactive
      expect(await agentManager.isAgentActive(agentId)).to.equal(false);

      // Reactivate agent
      await expect(
        agentManager.connect(user).activateAgent(agentId)
      ).to.emit(agentManager, "AgentStatusChanged")
        .withArgs(agentId, true);

      // Check that the agent is active again
      expect(await agentManager.isAgentActive(agentId)).to.equal(true);
    });
  });
}); 
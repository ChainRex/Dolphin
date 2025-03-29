// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BotNFT.sol";
import "./MCPServerManager.sol";

/**
 * @title AgentManager
 * @dev Manages Agent objects that represent autonomous agents with health, servers and balances
 */
contract AgentManager is Ownable, ReentrancyGuard {
    // Constants for health and epochs
    uint256 private constant DECIMAI = 1_000_000_000;
    uint256 private constant INITIAL_HEALTH = 100 * DECIMAI;
    uint256 private constant HEALTH_DECAY_PER_EPOCH = 1 * DECIMAI; // Amount of health lost per epoch
    uint256 private constant MAX_INACTIVE_EPOCHS = 100; // Epochs after which the agent becomes dormant
    uint256 private constant MIN_ACTIVATION_HEALTH = 1 * DECIMAI;
    uint256 private constant HEALTH_PER_ETH = 1000;

    // Error codes
    error AgentAlreadyActive();
    error InsufficientFunds();
    error NotAuthorized();
    error NotBotAddress();
    error MCPServerAlreadyExists();
    error MCPServerNotFound();
    error MCPServerNotEnabled();
    error InsufficientBalance();

    // Agent object definition
    struct Agent {
        uint256 botNftId; // NFT bot ID
        uint256 health; // Health points
        bool isActive; // Activation status
        bool isLocked; // Locked status for trading
        uint256 lastEpoch; // Last epoch the agent was updated
        uint256 inactiveEpochs; // Number of consecutive inactive epochs
        uint256 balance; // ETH balance
        address botAddress; // the authorized bot address
        uint256[] mcpServerIds; // IDs of MCPServers
        string appId; // Phala CVM app ID
    }

    // Mapping from agent ID to Agent
    mapping(uint256 => Agent) private _agents;

    // Counter for agent IDs
    uint256 private _nextAgentId;

    // BotNFT contract reference
    BotNFT private _botNFT;

    // MCPServerManager contract reference
    MCPServerManager private _mcpServerManager;

    // Events
    event AgentCreated(
        uint256 agentId,
        uint256 botNftId,
        address botAddress,
        string appId
    );
    event HealthUpdated(uint256 agentId, uint256 newHealth);
    event DepositReceived(uint256 agentId, uint256 amount);
    event WithdrawalMade(uint256 agentId, address to, uint256 amount);
    event AgentStatusChanged(uint256 agentId, bool isActive);
    event AgentLockToggled(uint256 agentId, bool isLocked);
    event MCPServerAdded(uint256 agentId, uint256 mcpServerId);
    event MCPServerRemoved(uint256 agentId, uint256 mcpServerId);

    /**
     * @dev Constructor
     * @param botNFT Address of the BotNFT contract
     * @param mcpServerManager Address of the MCPServerManager contract
     */
    constructor(address botNFT, address mcpServerManager) Ownable(msg.sender) {
        _botNFT = BotNFT(botNFT);
        _mcpServerManager = MCPServerManager(mcpServerManager);
    }

    /**
     * @dev Create a new Agent
     * @param botAddress Address of the bot that will be authorized to use this agent
     * @param name Name of the bot NFT
     * @param description Description of the bot NFT
     * @param imgUrl URL to the bot's image
     * @param appId Phala CVM app ID
     */
    function createAgent(
        address botAddress,
        string memory name,
        string memory description,
        string memory imgUrl,
        string memory appId
    ) public payable returns (uint256) {
        if (msg.value < INITIAL_HEALTH / HEALTH_PER_ETH) {
            revert InsufficientFunds();
        }

        // Mint bot NFT
        uint256 botNftId = _botNFT.mintBotNFT(
            msg.sender,
            name,
            description,
            imgUrl
        );

        uint256 agentId = _nextAgentId++;

        // Create agent
        _agents[agentId] = Agent({
            botNftId: botNftId,
            health: INITIAL_HEALTH,
            isActive: true,
            isLocked: false,
            lastEpoch: block.timestamp,
            inactiveEpochs: 0,
            balance: msg.value,
            botAddress: botAddress,
            mcpServerIds: new uint256[](0),
            appId: appId
        });

        emit AgentCreated(agentId, botNftId, botAddress, appId);

        return agentId;
    }

    /**
     * @dev Deposit ETH to maintain or restore health
     * @param agentId ID of the agent
     */
    function depositEth(uint256 agentId) public payable {
        if (msg.value == 0) {
            revert InsufficientFunds();
        }

        Agent storage agent = _agents[agentId];

        // Transfer the deposited ETH (already done via msg.value)
        agent.balance += msg.value;

        // Increase health (cap at INITIAL_HEALTH)
        agent.health += (msg.value * HEALTH_PER_ETH);
        if (agent.health > INITIAL_HEALTH) {
            agent.health = INITIAL_HEALTH;
        }

        // Reset inactive epoch counter and update the last epoch
        agent.inactiveEpochs = 0;
        agent.lastEpoch = block.timestamp;

        emit DepositReceived(agentId, msg.value);
        emit HealthUpdated(agentId, agent.health);
    }

    /**
     * @dev Update Agent Health based on time passed
     * @param agentId ID of the agent
     */
    function updateAgentHealth(uint256 agentId) public {
        Agent storage agent = _agents[agentId];

        // Only bot address can call this function
        if (msg.sender != agent.botAddress) {
            revert NotBotAddress();
        }

        uint256 currentTime = block.timestamp;

        // Calculate the number of epochs (days) since the last update
        // Assuming 1 epoch = 1 day = 86400 seconds
        uint256 epochsSinceLastUpdate = (currentTime - agent.lastEpoch) / 86400;

        if (epochsSinceLastUpdate > 0) {
            // Decrease health for each elapsed epoch
            uint256 totalDecay = epochsSinceLastUpdate * HEALTH_DECAY_PER_EPOCH;
            if (agent.health > totalDecay) {
                agent.health = agent.health - totalDecay;
            } else {
                agent.health = 0;
            }

            // Update inactive epochs if health is 0
            if (agent.health == 0) {
                agent.inactiveEpochs =
                    agent.inactiveEpochs +
                    epochsSinceLastUpdate;
            } else {
                agent.inactiveEpochs = 0; // Reset if health is maintained
            }

            // Mark the agent as dormant if inactive for too long
            if (agent.inactiveEpochs >= MAX_INACTIVE_EPOCHS) {
                agent.isActive = false;
                emit AgentStatusChanged(agentId, false);
            }

            // Update the last epoch
            agent.lastEpoch = currentTime;

            emit HealthUpdated(agentId, agent.health);
        }
    }

    /**
     * @dev Activate an Agent
     * @param agentId ID of the agent
     */
    function activateAgent(uint256 agentId) public {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        // Ensure the agent is not already active
        if (agent.isActive) {
            revert AgentAlreadyActive();
        }

        if (agent.health < MIN_ACTIVATION_HEALTH) {
            revert InsufficientFunds();
        }

        agent.isActive = true;

        emit AgentStatusChanged(agentId, true);
    }

    /**
     * @dev Lock or Unlock an Agent
     * @param agentId ID of the agent
     */
    function toggleLock(uint256 agentId) public {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        agent.isLocked = !agent.isLocked;

        emit AgentLockToggled(agentId, agent.isLocked);
    }

    /**
     * @dev Deactivate an Agent
     * @param agentId ID of the agent
     */
    function deactivateAgent(uint256 agentId) public {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        agent.isActive = false;

        emit AgentStatusChanged(agentId, false);
    }

    /**
     * @dev Add an MCP server to the agent
     * @param agentId ID of the agent
     * @param mcpServerId ID of the MCP server
     */
    function addMCPServer(uint256 agentId, uint256 mcpServerId) public {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        // Check if MCP server is enabled
        if (!_mcpServerManager.isEnabled(mcpServerId)) {
            revert MCPServerNotEnabled();
        }

        // Check if MCP server already exists
        for (uint256 i = 0; i < agent.mcpServerIds.length; i++) {
            if (agent.mcpServerIds[i] == mcpServerId) {
                revert MCPServerAlreadyExists();
            }
        }

        // Add MCP server to agent
        agent.mcpServerIds.push(mcpServerId);

        emit MCPServerAdded(agentId, mcpServerId);
    }

    /**
     * @dev Remove an MCP server from the agent
     * @param agentId ID of the agent
     * @param mcpServerId ID of the MCP server
     */
    function removeMCPServer(uint256 agentId, uint256 mcpServerId) public {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        bool found = false;
        uint256 indexToRemove;

        // Find MCP server to remove
        for (uint256 i = 0; i < agent.mcpServerIds.length; i++) {
            if (agent.mcpServerIds[i] == mcpServerId) {
                indexToRemove = i;
                found = true;
                break;
            }
        }

        if (!found) {
            revert MCPServerNotFound();
        }

        // Remove MCP server by swapping with the last element and then removing the last element
        if (indexToRemove < agent.mcpServerIds.length - 1) {
            agent.mcpServerIds[indexToRemove] = agent.mcpServerIds[
                agent.mcpServerIds.length - 1
            ];
        }
        agent.mcpServerIds.pop();

        emit MCPServerRemoved(agentId, mcpServerId);
    }

    /**
     * @dev Update the MCP servers array with a new set of servers
     * @param agentId ID of the agent
     * @param newMCPServerIds Array of MCP server IDs to set
     */
    function updateMCPServers(
        uint256 agentId,
        uint256[] memory newMCPServerIds
    ) public {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        // Replace the MCP servers array with the new one
        agent.mcpServerIds = newMCPServerIds;
    }

    /**
     * @dev Withdraw ETH using BotNFT ownership verification
     * @param agentId ID of the agent
     * @param amount Amount of ETH to withdraw
     */
    function withdrawEthWithNft(
        uint256 agentId,
        uint256 amount
    ) public nonReentrant {
        Agent storage agent = _agents[agentId];

        // Verify ownership of the bot NFT
        if (_botNFT.ownerOf(agent.botNftId) != msg.sender) {
            revert NotAuthorized();
        }

        // Check balance
        if (agent.balance < amount) {
            revert InsufficientBalance();
        }

        // Update balance
        agent.balance -= amount;

        // Transfer ETH to sender
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit WithdrawalMade(agentId, msg.sender, amount);
    }

    /**
     * @dev Withdraw ETH using bot_address verification
     * @param agentId ID of the agent
     * @param amount Amount of ETH to withdraw
     */
    function withdrawEthAsBot(
        uint256 agentId,
        uint256 amount
    ) public nonReentrant {
        Agent storage agent = _agents[agentId];

        // Verify bot address
        if (msg.sender != agent.botAddress) {
            revert NotBotAddress();
        }

        // Check balance
        if (agent.balance < amount) {
            revert InsufficientBalance();
        }

        // Update balance
        agent.balance -= amount;

        // Transfer ETH to sender
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit WithdrawalMade(agentId, msg.sender, amount);
    }

    /**
     * @dev Get Agent details
     * @param agentId ID of the agent
     */
    function getAgentDetails(
        uint256 agentId
    )
        public
        view
        returns (
            uint256 botNftId,
            uint256 health,
            bool isActive,
            bool isLocked,
            uint256 lastEpoch,
            uint256 inactiveEpochs,
            uint256 balance,
            address botAddress,
            uint256[] memory mcpServerIds,
            string memory appId
        )
    {
        Agent storage agent = _agents[agentId];
        return (
            agent.botNftId,
            agent.health,
            agent.isActive,
            agent.isLocked,
            agent.lastEpoch,
            agent.inactiveEpochs,
            agent.balance,
            agent.botAddress,
            agent.mcpServerIds,
            agent.appId
        );
    }

    /**
     * @dev Check if an agent is active
     * @param agentId ID of the agent
     */
    function isAgentActive(uint256 agentId) public view returns (bool) {
        return _agents[agentId].isActive;
    }

    /**
     * @dev Get agent health
     * @param agentId ID of the agent
     */
    function getAgentHealth(uint256 agentId) public view returns (uint256) {
        return _agents[agentId].health;
    }
}

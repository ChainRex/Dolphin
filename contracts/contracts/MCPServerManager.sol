// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MCPServerManager
 * @dev Manages MCP Server objects that provide functionality to Agent
 */
contract MCPServerManager is Ownable {
    // Error codes
    error InsufficientPayment();
    error InvalidAuthor();
    error MCPServerDisabled();

    // MCPServer types as bytes
    bytes public constant MCPSERVER_TYPE_READ_ONLY = "READ_ONLY";
    bytes public constant MCPSERVER_TYPE_BLOCKCHAIN_WRITE = "BLOCKCHAIN_WRITE";
    bytes public constant MCPSERVER_TYPE_FUND_CUSTODY = "FUND_CUSTODY";
    bytes public constant MCPSERVER_TYPE_INTERNET_WRITE = "INTERNET_WRITE";

    // MCPServer object definition
    struct MCPServer {
        uint256 id;
        string name;
        string description;
        string endpoint;
        string githubRepo;
        string dockerImage;
        string appId; // Phala CVM app ID
        uint256 fee;
        address author;
        bool isEnabled;
        string mcpServerType; // Type of the MCP server (READ_ONLY, BLOCKCHAIN_WRITE, FUND_CUSTODY, INTERNET_WRITE)
    }

    // Mapping from MCP server ID to MCP server
    mapping(uint256 => MCPServer) private _mcpServers;

    // Counter for MCP server IDs
    uint256 private _nextMCPServerId;

    // Events
    event MCPServerCreated(
        uint256 mcpServerId,
        string name,
        string mcpServerType,
        address author
    );
    event MCPServerUpdated(
        uint256 mcpServerId,
        string name,
        string description,
        uint256 fee
    );
    event MCPServerToggled(uint256 mcpServerId, bool isEnabled);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new MCP server
     * @param name Name of the MCP server
     * @param description Description of the MCP server
     * @param endpoint Endpoint of the MCP server
     * @param githubRepo GitHub repository of the MCP server
     * @param dockerImage Docker image of the MCP server
     * @param appId Phala CVM app ID
     * @param fee Fee for using the MCP server
     * @param mcpServerType Type of the MCP server
     */
    function createMCPServer(
        string memory name,
        string memory description,
        string memory endpoint,
        string memory githubRepo,
        string memory dockerImage,
        string memory appId,
        uint256 fee,
        string memory mcpServerType
    ) public returns (uint256) {
        uint256 mcpServerId = _nextMCPServerId++;

        _mcpServers[mcpServerId] = MCPServer({
            id: mcpServerId,
            name: name,
            description: description,
            endpoint: endpoint,
            githubRepo: githubRepo,
            dockerImage: dockerImage,
            appId: appId,
            fee: fee,
            author: msg.sender,
            isEnabled: true,
            mcpServerType: mcpServerType
        });

        emit MCPServerCreated(mcpServerId, name, mcpServerType, msg.sender);

        return mcpServerId;
    }

    /**
     * @dev Update MCP server details
     * @param mcpServerId ID of the MCP server
     * @param name Name of the MCP server
     * @param description Description of the MCP server
     * @param fee Fee for using the MCP server
     */
    function updateMCPServer(
        uint256 mcpServerId,
        string memory name,
        string memory description,
        uint256 fee
    ) public {
        MCPServer storage mcpServer = _mcpServers[mcpServerId];

        // Only author can update the MCP server
        if (msg.sender != mcpServer.author) {
            revert InvalidAuthor();
        }

        mcpServer.name = name;
        mcpServer.description = description;
        mcpServer.fee = fee;

        emit MCPServerUpdated(mcpServerId, name, description, fee);
    }

    /**
     * @dev Toggle MCP server enabled status
     * @param mcpServerId ID of the MCP server
     */
    function toggleMCPServer(uint256 mcpServerId) public {
        MCPServer storage mcpServer = _mcpServers[mcpServerId];

        // Only author can toggle the MCP server
        if (msg.sender != mcpServer.author) {
            revert InvalidAuthor();
        }

        mcpServer.isEnabled = !mcpServer.isEnabled;

        emit MCPServerToggled(mcpServerId, mcpServer.isEnabled);
    }

    /**
     * @dev Check if MCP server is enabled
     * @param mcpServerId ID of the MCP server
     */
    function isEnabled(uint256 mcpServerId) public view returns (bool) {
        return _mcpServers[mcpServerId].isEnabled;
    }

    /**
     * @dev Get MCP server type
     * @param mcpServerId ID of the MCP server
     */
    function getMCPServerType(
        uint256 mcpServerId
    ) public view returns (string memory) {
        return _mcpServers[mcpServerId].mcpServerType;
    }

    /**
     * @dev Get MCP server details
     * @param mcpServerId ID of the MCP server
     */
    function getMCPServerDetails(
        uint256 mcpServerId
    )
        public
        view
        returns (
            string memory name,
            string memory description,
            string memory endpoint,
            string memory githubRepo,
            string memory dockerImage,
            string memory appId,
            uint256 fee,
            address author,
            bool serverEnabled,
            string memory mcpServerType
        )
    {
        MCPServer storage mcpServer = _mcpServers[mcpServerId];
        return (
            mcpServer.name,
            mcpServer.description,
            mcpServer.endpoint,
            mcpServer.githubRepo,
            mcpServer.dockerImage,
            mcpServer.appId,
            mcpServer.fee,
            mcpServer.author,
            mcpServer.isEnabled,
            mcpServer.mcpServerType
        );
    }
}

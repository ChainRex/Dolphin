// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BotNFT
 * @dev ERC721 token representing ownership of Anemone bots
 */
contract BotNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Counter for token IDs
    uint256 private _nextTokenId;

    // Mapping from token ID to metadata
    mapping(uint256 => BotMetadata) private _metadata;

    // Bot metadata structure
    struct BotMetadata {
        string name;
        string description;
        string imageUrl;
        mapping(string => string) attributes;
    }

    // Events
    event BotCreated(
        uint256 tokenId,
        string name,
        string description,
        string imageUrl
    );
    event AttributeAdded(
        uint256 tokenId,
        string attributeName,
        string attributeValue
    );

    constructor() ERC721("Anemone Bot", "ABOT") Ownable(msg.sender) {}

    /**
     * @dev Mint new Bot NFT
     * @param to Address to mint the NFT to
     * @param name Name of the bot
     * @param description Description of the bot
     * @param imageUrl URL to the bot's image
     * @return tokenId The ID of the newly minted token
     */
    function mintBotNFT(
        address to,
        string memory name,
        string memory description,
        string memory imageUrl
    ) public returns (uint256) {
        require(to != address(0), "BotNFT: mint to the zero address");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        // Set metadata
        _metadata[tokenId].name = name;
        _metadata[tokenId].description = description;
        _metadata[tokenId].imageUrl = imageUrl;

        emit BotCreated(tokenId, name, description, imageUrl);

        return tokenId;
    }

    /**
     * @dev Add attributes to an existing Bot NFT
     * @param tokenId Token ID of the Bot NFT
     * @param attributeName Name of the attribute
     * @param attributeValue Value of the attribute
     */
    function addAttribute(
        uint256 tokenId,
        string memory attributeName,
        string memory attributeValue
    ) public {
        require(
            _exists(tokenId),
            "BotNFT: attribute query for nonexistent token"
        );
        require(
            ownerOf(tokenId) == msg.sender || owner() == msg.sender,
            "BotNFT: caller is not owner nor approved"
        );

        _metadata[tokenId].attributes[attributeName] = attributeValue;

        emit AttributeAdded(tokenId, attributeName, attributeValue);
    }

    /**
     * @dev Get bot metadata
     * @param tokenId Token ID of the Bot NFT
     * @return name Name of the bot
     * @return description Description of the bot
     * @return imageUrl URL to the bot's image
     */
    function getBotMetadata(
        uint256 tokenId
    )
        public
        view
        returns (
            string memory name,
            string memory description,
            string memory imageUrl
        )
    {
        require(
            _exists(tokenId),
            "BotNFT: metadata query for nonexistent token"
        );

        BotMetadata storage metadata = _metadata[tokenId];
        return (metadata.name, metadata.description, metadata.imageUrl);
    }

    /**
     * @dev Get attribute value
     * @param tokenId Token ID of the Bot NFT
     * @param attributeName Name of the attribute
     * @return The value of the attribute
     */
    function getAttribute(
        uint256 tokenId,
        string memory attributeName
    ) public view returns (string memory) {
        require(
            _exists(tokenId),
            "BotNFT: attribute query for nonexistent token"
        );

        return _metadata[tokenId].attributes[attributeName];
    }

    // Required overrides for ERC721URIStorage
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Internal helper function to check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId < _nextTokenId && _ownerOf(tokenId) != address(0);
    }
}

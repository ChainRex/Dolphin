import { InjectedConnector } from '@web3-react/injected-connector';

export const BOT_NFT_ADDRESS = '0x45ea55087F7CD26273a631E0eD23F90E6BC683f5';

export const injected = new InjectedConnector({
    supportedChainIds: [97], // BSC Testnet
});

export const BOT_NFT_ABI = [
    'function mintBotNFT(address to, string memory name, string memory description, string memory imageUrl) public returns (uint256)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
    'function getBotMetadata(uint256 tokenId) public view returns (string memory name, string memory description, string memory imageUrl)',
    'function addAttribute(uint256 tokenId, string memory attributeName, string memory attributeValue) public',
    'function getAttribute(uint256 tokenId, string memory attributeName) public view returns (string memory)',
    'event BotCreated(uint256 tokenId, string name, string description, string imageUrl)',
    'event AttributeAdded(uint256 tokenId, string attributeName, string attributeValue)'
]; 
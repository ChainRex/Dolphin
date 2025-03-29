import { InjectedConnector } from '@web3-react/injected-connector';

export const BOT_NFT_ADDRESS = '0x45ea55087F7CD26273a631E0eD23F90E6BC683f5';

export const injected = new InjectedConnector({
    supportedChainIds: [97], // BSC Testnet
});

export const BOT_NFT_ABI = [
    'function createBot(string memory name, string memory url, string memory description) public returns (uint256)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'function tokenURI(uint256 tokenId) public view returns (string memory)',
]; 
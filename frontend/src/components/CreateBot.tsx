import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Text,
    Container,
    Select,
    Card,
    CardBody,
    Heading,
} from '@chakra-ui/react';
import { BOT_NFT_ADDRESS, BOT_NFT_ABI } from '../config/web3';

// BSC 节点列表
const BSC_NODES = [
    { name: 'BSC 节点 1', url: 'https://bsc-dataseed1.binance.org/' },
    { name: 'BSC 节点 2', url: 'https://bsc-dataseed2.binance.org/' },
    { name: 'BSC 节点 3', url: 'https://bsc-dataseed3.binance.org/' },
    { name: 'BSC 节点 4', url: 'https://bsc-dataseed4.binance.org/' },
    { name: 'NodeReal', url: 'https://bsc-mainnet.nodereal.io' },
    { name: 'BNB48', url: 'https://rpc-bsc.bnb48.io' }
];

// 添加重试函数
const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay);
    }
};

export const CreateBot: React.FC = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState(BSC_NODES[0].url);
    const toast = useToast();

    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);
            }
        };
        initProvider();
    }, []);

    const switchNode = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('请先安装 MetaMask');
            }

            // 请求用户切换网络
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }], // BSC 主网
            });

            // 重新连接钱包
            await connectWallet();
        } catch (error: any) {
            console.error('切换节点错误:', error);
            toast({
                title: '切换节点失败',
                description: error?.message || '请确保 MetaMask 已安装',
                status: 'error',
                duration: 5000,
            });
        }
    };

    const connectWallet = async () => {
        try {
            if (!provider) {
                throw new Error('请先安装 MetaMask');
            }

            // 使用重试机制连接钱包
            await retry(async () => {
                await provider.send("eth_requestAccounts", []);
            });

            const signer = provider.getSigner();
            const account = await retry(async () => {
                return await signer.getAddress();
            });

            setSigner(signer);
            setAccount(account);

            const contract = new ethers.Contract(
                BOT_NFT_ADDRESS,
                BOT_NFT_ABI,
                signer
            );
            setContract(contract);

            toast({
                title: '钱包连接成功',
                status: 'success',
                duration: 3000,
            });
        } catch (error: any) {
            console.error('连接错误:', error);
            toast({
                title: '连接失败',
                description: error?.message || '请确保已安装 MetaMask',
                status: 'error',
                duration: 5000,
            });
        }
    };

    const createBot = async () => {
        if (!contract || !account) {
            toast({
                title: '请先连接钱包',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        try {
            setIsLoading(true);

            // 使用重试机制创建 Bot
            const tx = await retry(async () => {
                return await contract.createBot(name, url, description);
            });

            // 等待交易确认
            await retry(async () => {
                return await tx.wait();
            });

            toast({
                title: 'Bot 创建成功',
                status: 'success',
                duration: 3000,
            });

            // 清空表单
            setName('');
            setUrl('');
            setDescription('');
        } catch (error: any) {
            console.error('创建错误:', error);
            let errorMessage = '未知错误';

            if (error.code === 429) {
                errorMessage = '请求过于频繁，请尝试切换节点或稍后再试';
            } else if (error.code === 4001) {
                errorMessage = '用户拒绝了交易';
            } else if (error.message?.includes('insufficient funds')) {
                errorMessage = '余额不足';
            } else if (error.message?.includes('nonce too low')) {
                errorMessage = '交易 nonce 过低，请刷新页面重试';
            }

            toast({
                title: '创建失败',
                description: errorMessage,
                status: 'error',
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <Card>
                <CardBody>
                    <VStack spacing={6} align="stretch">
                        <Heading size="lg" textAlign="center">
                            创建新的 Bot
                        </Heading>

                        <FormControl>
                            <FormLabel>BSC 节点</FormLabel>
                            <Select
                                value={selectedNode}
                                onChange={(e) => setSelectedNode(e.target.value)}
                                bg="white"
                            >
                                {BSC_NODES.map((node) => (
                                    <option key={node.url} value={node.url}>
                                        {node.name}
                                    </option>
                                ))}
                            </Select>
                            <Button
                                mt={2}
                                colorScheme="blue"
                                size="sm"
                                onClick={switchNode}
                            >
                                切换节点
                            </Button>
                        </FormControl>

                        {!account ? (
                            <Button colorScheme="blue" onClick={connectWallet}>
                                连接 MetaMask
                            </Button>
                        ) : (
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Bot 名称</FormLabel>
                                    <Input
                                        value={name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                        placeholder="输入 Bot 名称"
                                        bg="white"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>URL</FormLabel>
                                    <Input
                                        value={url}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                        placeholder="输入 Bot URL"
                                        bg="white"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>描述</FormLabel>
                                    <Input
                                        value={description}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                                        placeholder="输入 Bot 描述"
                                        bg="white"
                                    />
                                </FormControl>

                                <Button
                                    colorScheme="green"
                                    onClick={createBot}
                                    isLoading={isLoading}
                                    w="100%"
                                >
                                    创建 Bot
                                </Button>
                            </VStack>
                        )}
                    </VStack>
                </CardBody>
            </Card>
        </Container>
    );
}; 
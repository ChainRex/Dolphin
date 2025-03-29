import React, { useState } from 'react';
import { useAccount, useConnect, useContractWrite, useWaitForTransaction } from 'wagmi';
import { injected } from 'wagmi/connectors';
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
} from '@chakra-ui/react';
import { BOT_NFT_ADDRESS, BOT_NFT_ABI } from '../config/web3';

export const CreateBot: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({ connector: injected() });
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const toast = useToast();

    const { data, write } = useContractWrite({
        address: BOT_NFT_ADDRESS,
        abi: BOT_NFT_ABI,
        functionName: 'createBot',
    });

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    const connectWallet = async () => {
        try {
            await connect();
            toast({
                title: '钱包连接成功',
                status: 'success',
                duration: 3000,
            });
        } catch (error: any) {
            toast({
                title: '连接失败',
                description: error?.message || '请确保已安装 MetaMask',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const createBot = async () => {
        if (!isConnected) {
            toast({
                title: '请先连接钱包',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        try {
            write({
                args: [name, url, description],
            });
        } catch (error: any) {
            toast({
                title: '创建失败',
                description: error?.message || '未知错误',
                status: 'error',
                duration: 3000,
            });
        }
    };

    React.useEffect(() => {
        if (isSuccess) {
            toast({
                title: 'Bot 创建成功',
                status: 'success',
                duration: 3000,
            });
            // 清空表单
            setName('');
            setUrl('');
            setDescription('');
        }
    }, [isSuccess, toast]);

    return (
        <Container maxW="container.md" py={8}>
            <VStack spacing={6}>
                <Text fontSize="2xl" fontWeight="bold">
                    创建新的 Bot
                </Text>

                {!isConnected ? (
                    <Button colorScheme="blue" onClick={connectWallet}>
                        连接 MetaMask
                    </Button>
                ) : (
                    <Box w="100%">
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Bot 名称</FormLabel>
                                <Input
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    placeholder="输入 Bot 名称"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>URL</FormLabel>
                                <Input
                                    value={url}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                                    placeholder="输入 Bot URL"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>描述</FormLabel>
                                <Input
                                    value={description}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                                    placeholder="输入 Bot 描述"
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
                    </Box>
                )}
            </VStack>
        </Container>
    );
}; 
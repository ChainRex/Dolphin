import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  balance: string;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  balance: '',
  provider: null,
  signer: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

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

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateBalance(provider, accounts[0]);
          } else {
            setAccount(null);
            setBalance('');
          }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
    };
    
    initProvider();
    
    return () => {
      // 清理监听器
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  // 更新余额
  const updateBalance = async (provider: ethers.providers.Web3Provider, account: string) => {
    try {
      const balance = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('获取余额失败', error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
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
      updateBalance(provider, account);
    } catch (error: any) {
      console.error('连接错误:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance('');
    setSigner(null);
  };

  return (
    <WalletContext.Provider 
      value={{ 
        account, 
        balance, 
        provider, 
        signer, 
        isConnecting, 
        connectWallet, 
        disconnectWallet 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 
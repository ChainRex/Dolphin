import React from 'react';
import { Button, Dropdown, Space, Typography } from 'antd';
import { DownOutlined, CopyOutlined, LinkOutlined, LogoutOutlined } from '@ant-design/icons';
import { useWallet } from '../contexts/WalletContext';

const { Text } = Typography;

export const ConnectButton: React.FC = () => {
  const { account, balance, isConnecting, connectWallet, disconnectWallet } = useWallet();

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // 复制地址到剪贴板
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  // 在区块浏览器中查看地址
  const viewOnExplorer = () => {
    if (account) {
      window.open(`https://etherscan.io/address/${account}`, '_blank');
    }
  };

  if (!account) {
    return (
      <Button
        type="primary"
        onClick={connectWallet}
        loading={isConnecting}
      >
        连接钱包
      </Button>
    );
  }

  const items = [
    {
      key: '1',
      label: '复制地址',
      icon: <CopyOutlined />,
      onClick: copyAddress
    },
    {
      key: '2',
      label: '在区块浏览器中查看',
      icon: <LinkOutlined />,
      onClick: viewOnExplorer
    },
    {
      key: '3',
      label: '断开连接',
      icon: <LogoutOutlined />,
      onClick: disconnectWallet
    }
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button type="primary">
        <Space>
          <Text style={{ color: 'white' }}>{formatAddress(account)}</Text>
          <Text style={{ color: 'white', fontSize: '12px' }}>{parseFloat(balance).toFixed(4)} ETH</Text>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}; 
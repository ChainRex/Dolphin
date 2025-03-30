import React from 'react';
import { Card, Typography, Button, Space, Tag, Divider, Row, Col } from 'antd';
import { useWallet } from '../contexts/WalletContext';

const { Title, Text } = Typography;

export const WalletConnect: React.FC = () => {
  const { account, balance, isConnecting, connectWallet, disconnectWallet } = useWallet();

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
  };

  return (
    <Row justify="center" align="middle">
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card>
          <Title level={3} style={{ textAlign: 'center' }}>以太坊钱包连接</Title>
          
          {!account ? (
            <Button 
              type="primary" 
              onClick={connectWallet} 
              loading={isConnecting}
              style={{ width: '100%', marginTop: '20px' }}
            >
              连接 MetaMask
            </Button>
          ) : (
            <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>钱包状态:</Text>
                <Tag color="success">已连接</Tag>
              </div>
              
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                <Text>地址: {formatAddress(account)}</Text>
                <Divider style={{ margin: '8px 0' }} />
                <Text>余额: {balance} ETH</Text>
              </div>
              
              <Button danger onClick={disconnectWallet} style={{ width: '100%' }}>
                断开连接
              </Button>
            </Space>
          )}
        </Card>
      </Col>
    </Row>
  );
}; 
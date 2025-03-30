import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Space } from 'antd';
import { ConnectButton } from './ConnectButton';

const { Header } = Layout;
const { Title } = Typography;

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: '/create-agent',
      label: '创建Agent',
      onClick: () => navigate('/create-agent')
    },
    {
      key: '/wallet',
      label: '钱包',
      onClick: () => navigate('/wallet')
    },
    {
      key: '/other-page',
      label: '其他页面',
      onClick: () => navigate('/other-page')
    }
  ];

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
      <Space>
        <Title level={4} style={{ color: 'white', margin: 0 }}>以太坊 DApp</Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={items}
          style={{ minWidth: 200 }}
        />
      </Space>
      <ConnectButton />
    </Header>
  );
}; 
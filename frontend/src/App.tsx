import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout, theme } from 'antd';
import { WalletProvider } from './contexts/WalletContext';
import { Navigation } from './components/Navigation';
import { WalletConnect } from './components/WalletConnect';
import { AgentMint } from './components/AgentMint';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <WalletProvider>
        <Router>
          <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <Content style={{ flex: 1, padding: '24px 50px' }}>
              <Routes>
                <Route path="/create-agent" element={<AgentMint />} />
                <Route path="/wallet" element={<WalletConnect />} />
                <Route path="/other-page" element={<div>其他页面内容</div>} />
                <Route path="/" element={<Navigate to="/create-agent" replace />} />
              </Routes>
            </Content>
          </Layout>
        </Router>
      </WalletProvider>
    </ConfigProvider>
  );
}

export default App;

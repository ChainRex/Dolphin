import React from 'react';
import { Form, Input, Button, Card, Typography, Spin } from 'antd';
import { useWallet } from '../contexts/WalletContext';
import { useAgentStore } from '../store/agentStore';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import { ethers } from 'ethers';
import { BOT_NFT_ADDRESS, BOT_NFT_ABI } from '../config/web3';

const { Title } = Typography;

export const AgentMint: React.FC = () => {
  const {
    agentName,
    agentLogo,
    agentDescription,
    isLoading,
    setAgentName,
    setAgentLogo,
    setAgentDescription,
    setIsLoading,
  } = useAgentStore();

  const { account, signer } = useWallet();
  const { toasts, showToast, hideToast } = useToast();

  const handleCreateAgent = async () => {
    if (!account || !signer) {
      showToast("请先连接钱包", "error");
      return;
    }

    try {
      setIsLoading(true);
      showToast("生成地址中...", "info");

      // 模拟生成地址的API调用
      const address = ethers.Wallet.createRandom().address;
      console.log("生成的地址:", address);
      showToast("地址生成成功", "info");

      // 创建NFT合约实例
      const contract = new ethers.Contract(BOT_NFT_ADDRESS, BOT_NFT_ABI, signer);

      // 调用合约创建Agent
      showToast("创建Agent中...", "info");
      const tx = await contract.createBot(
        agentName,
        agentLogo,
        agentDescription,
        { value: ethers.utils.parseEther("0.01") } // 支付0.01 ETH
      );

      // 等待交易确认
      const receipt = await tx.wait();
      console.log("交易确认:", receipt);

      // 从事件中获取创建的NFT ID
      const event = receipt.events?.find(e => e.event === 'BotCreated');
      const botId = event?.args?.botId;
      console.log("创建的Bot ID:", botId);

      showToast(
        "Agent创建成功!",
        "success",
        receipt.transactionHash,
        `https://etherscan.io/token/${BOT_NFT_ADDRESS}?a=${botId}`
      );
    } catch (error: any) {
      console.error("创建Agent失败:", error);
      showToast(error.message || "创建Agent失败", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取按钮文本
  const getButtonText = () => {
    if (!account) {
      return "连接钱包";
    }
    return isLoading ? <Spin size="small" /> : "创建Agent";
  };

  // 判断按钮是否禁用
  const isButtonDisabled = () => {
    const trimmedName = agentName.trim();
    const trimmedLogo = agentLogo.trim();
    const trimmedDescription = agentDescription.trim();

    // 检查所有字段是否都已填写
    const allFieldsFilled = trimmedName && trimmedLogo && trimmedDescription;

    return isLoading || !allFieldsFilled;
  };

  // 按钮点击处理
  const handleButtonClick = () => {
    if (!account) {
      // 如果未连接钱包，触发钱包连接
      document.querySelector<HTMLButtonElement>(".connect-wallet-button")?.click();
      return;
    }
    handleCreateAgent();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
          创建Agent
        </Title>

        <Form layout="vertical" onFinish={handleButtonClick}>
          <Form.Item label="Agent名称" required>
            <Input
              placeholder="输入Agent名称"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              onBlur={(e) => setAgentName(e.target.value.trim())}
            />
          </Form.Item>

          <Form.Item label="Agent Logo URL" required>
            <Input
              placeholder="输入Agent Logo URL"
              value={agentLogo}
              onChange={(e) => setAgentLogo(e.target.value)}
              onBlur={(e) => setAgentLogo(e.target.value.trim())}
            />
          </Form.Item>

          <Form.Item label="Agent描述" required>
            <Input.TextArea
              placeholder="输入Agent描述"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              onBlur={(e) => setAgentDescription(e.target.value.trim())}
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={isButtonDisabled()}
              loading={isLoading}
              className="connect-wallet-button"
            >
              {getButtonText()}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 渲染Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
          txHash={toast.txHash}
          tokenUrl={toast.tokenUrl}
          duration={toast.type === "success" ? 6000 : 3000}
        />
      ))}
    </div>
  );
}; 
import React from 'react';
import { Form, Input, Button, Card, Typography, Spin } from 'antd';
import { useWallet } from '../contexts/WalletContext';
import { useAgentStore } from '../store/agentStore';
import { useToast } from '../hooks/useToast';
import { Toast } from './Toast';
import { ethers } from 'ethers';
import { BOT_NFT_ADDRESS, BOT_NFT_ABI } from '../config/web3';

const { Title } = Typography;

// 重试函数
const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

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
      showToast("创建Bot中...", "info");

      // 创建NFT合约实例
      const contract = new ethers.Contract(BOT_NFT_ADDRESS, BOT_NFT_ABI, signer);

      // 使用重试机制调用合约创建Bot
      const tx = await retry(async () => {
        return await contract.mintBotNFT(
          account,           // 接收NFT的地址
          agentName,         // Bot名称
          agentDescription,  // Bot描述
          agentLogo         // Bot图片URL
        );
      });

      showToast("等待交易确认...", "info");

      // 等待交易确认
      const receipt = await tx.wait();
      console.log("交易确认:", receipt);

      // 从事件中获取创建的NFT ID
      const event = receipt.events?.find((e: any) => e.event === 'BotCreated');
      const tokenId = event?.args?.tokenId;
      console.log("创建的Bot ID:", tokenId);

      showToast(
        "Bot创建成功!",
        "success",
        receipt.transactionHash,
        `https://bscscan.com/token/${BOT_NFT_ADDRESS}?a=${tokenId}`
      );
    } catch (error: any) {
      console.error("创建Bot失败:", error);
      let errorMessage = "创建Bot失败";

      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = "请求过于频繁，请稍后重试";
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = "钱包余额不足";
      } else if (error.message?.includes('user rejected')) {
        errorMessage = "交易被用户拒绝";
      } else if (error.message?.includes('nonce too low')) {
        errorMessage = "交易序号错误，请刷新页面重试";
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取按钮文本
  const getButtonText = () => {
    if (!account) {
      return "连接钱包";
    }
    return isLoading ? <Spin size="small" /> : "创建Bot";
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
          创建Bot
        </Title>

        <Form layout="vertical" onFinish={handleButtonClick}>
          <Form.Item label="Bot名称" required>
            <Input
              placeholder="输入Bot名称"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              onBlur={(e) => setAgentName(e.target.value.trim())}
            />
          </Form.Item>

          <Form.Item label="Bot Logo URL" required>
            <Input
              placeholder="输入Bot Logo URL"
              value={agentLogo}
              onChange={(e) => setAgentLogo(e.target.value)}
              onBlur={(e) => setAgentLogo(e.target.value.trim())}
            />
          </Form.Item>

          <Form.Item label="Bot描述" required>
            <Input.TextArea
              placeholder="输入Bot描述"
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
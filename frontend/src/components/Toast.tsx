import React, { useEffect } from 'react';
import { Alert, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  txHash?: string;
  tokenUrl?: string;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  onClose, 
  txHash, 
  tokenUrl, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 1000,
      maxWidth: '350px'
    }}>
      <Alert
        message={message}
        type={type}
        showIcon
        closable
        closeIcon={<CloseOutlined />}
        onClose={onClose}
        action={
          <Space>
            {txHash && (
              <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                View Transaction
              </a>
            )}
            {tokenUrl && (
              <a href={tokenUrl} target="_blank" rel="noopener noreferrer">
                View Token
              </a>
            )}
          </Space>
        }
      />
    </div>
  );
}; 
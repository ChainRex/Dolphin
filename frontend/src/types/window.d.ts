interface Window {
    ethereum?: {
        isMetaMask?: boolean;
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        on: (eventName: string, callback: (params: any) => void) => void;
        removeListener: (eventName: string, callback: (params: any) => void) => void;
    };
} 
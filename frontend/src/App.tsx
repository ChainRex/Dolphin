import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { ChakraProvider } from '@chakra-ui/react';
import { CreateBot } from './components/CreateBot';

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>
        <CreateBot />
      </ChakraProvider>
    </Web3ReactProvider>
  );
}

export default App;

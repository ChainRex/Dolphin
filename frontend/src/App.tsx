import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CreateBot } from './components/CreateBot';

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>
        <Router>
          <Routes>
            <Route path="/create-bot" element={<CreateBot />} />
          </Routes>
        </Router>
      </ChakraProvider>
    </Web3ReactProvider>
  );
}

export default App;

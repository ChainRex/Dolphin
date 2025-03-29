import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CreateBot } from './components/CreateBot';

// 创建自定义主题
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50', // 浅灰色背景
        color: 'gray.800', // 深灰色文字
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        bg: 'white', // 白色背景
        p: 4,
        borderRadius: 'md',
        boxShadow: 'sm',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/create-bot" element={<CreateBot />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;

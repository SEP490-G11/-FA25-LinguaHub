// Phát hiện lỗi trong dev mode
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
//Cho phép điều hướng trang
import { BrowserRouter } from 'react-router-dom';
//Cho phép dùng Redux
import { Provider } from 'react-redux';
import { store } from '@/app/store/store';
//React Query for server state management
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
//Cuộn lên đầu khi đổi trang
import { ScrollToTop } from '@/shared/hooks/ScrollToTop.tsx';
import App from './App';
import './index.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);

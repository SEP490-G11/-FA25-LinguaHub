// Phát hiện lỗi trong dev mode
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

//Cho phép điều hướng trang
import { BrowserRouter } from 'react-router-dom';

//React Query for server state management
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

//Cuộn lên đầu khi đổi trang
import { ScrollToTop } from '@/hooks/ScrollToTop.tsx';

import App from './App';
import './index.css';

import { GoogleOAuthProvider } from "@react-oauth/google";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <GoogleOAuthProvider clientId="638401878385-gh2n42j1vc8dmbcnrfgtu094omv5qha0.apps.googleusercontent.com">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </StrictMode>
);

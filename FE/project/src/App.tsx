import  { useEffect } from 'react';//hook của React
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from '@/app/routes/AppRoutes';
import {checkAuth, loadUserFromStorage} from '@/app/store/slices/authSlice.ts';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import { SidebarProvider } from '@/contexts/SidebarContext';
//kiểu dữ liệu TypeScript định nghĩa loại dispatch
//TypeScript muốn biết trước dispatch sẽ gửi kiểu dữ liệu gì
import type { AppDispatch } from '@/app/store/store.ts';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    
    // Kiểm tra xem có phải trang tutor không
    const isTutorPage = location.pathname.startsWith('/tutor');
    
    useEffect(() => {
        dispatch(loadUserFromStorage()); // <-- lấy user từ localStorage
        dispatch(checkAuth());           // <-- xác thực lại token với backend
    }, [dispatch]);

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background">
                <Header />
                <main>
                    <AppRoutes />
                </main>
                {/* Ẩn Footer khi ở trang tutor */}
                {!isTutorPage && <Footer />}
            </div>
        </SidebarProvider>
    );
}

export default App;

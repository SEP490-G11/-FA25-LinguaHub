import  { useEffect } from 'react';//hook của React
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import {checkAuth, loadUserFromStorage} from '@/redux/slices/authSlice.ts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SidebarProvider } from '@/contexts/SidebarContext';
//kiểu dữ liệu TypeScript định nghĩa loại dispatch
//TypeScript muốn biết trước dispatch sẽ gửi kiểu dữ liệu gì
import type { AppDispatch } from '@/redux/store.ts';

function App() {
    const dispatch = useDispatch<AppDispatch>();
<<<<<<< Updated upstream
=======
    const location = useLocation();
    
    // Kiểm tra xem có phải trang tutor không
    const isTutorPage = location.pathname.startsWith('/tutor');

>>>>>>> Stashed changes
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
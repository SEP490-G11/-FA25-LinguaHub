import  { useEffect } from 'react';//hook của React
import { useDispatch } from 'react-redux';
import { AppRoutes } from '@/routes/AppRoutes';
import {checkAuth, loadUserFromStorage} from '@/redux/slices/authSlice.ts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
//kiểu dữ liệu TypeScript định nghĩa loại dispatch
//TypeScript muốn biết trước dispatch sẽ gửi kiểu dữ liệu gì
import type { AppDispatch } from '@/redux/store.ts';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(loadUserFromStorage()); // <-- lấy user từ localStorage
        dispatch(checkAuth());           // <-- xác thực lại token với backend
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <AppRoutes />
            </main>
            <Footer />
        </div>
    );
}

export default App;
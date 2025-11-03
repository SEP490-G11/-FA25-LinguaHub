import  { useEffect } from 'react';//hook của React
import { useDispatch } from 'react-redux';
import { AppRoutes } from '@/routes/AppRoutes';
import { checkAuth } from '@/redux/slices/authSlice.ts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
//kiểu dữ liệu TypeScript định nghĩa loại dispatch
//TypeScript muốn biết trước dispatch sẽ gửi kiểu dữ liệu gì
import type { AppDispatch } from '@/redux/store.ts';

function App() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(checkAuth());
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
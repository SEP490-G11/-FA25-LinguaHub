import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { loadUserFromStorage } from '@/redux/slices/authSlice.ts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ScrollToTop } from "@/hooks/ScrollToTop";

import type { AppDispatch } from '@/redux/store.ts';

function App() {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const isTutorPage = location.pathname.startsWith('/tutor');

    useEffect(() => {
        dispatch(loadUserFromStorage());
        // dispatch(checkAuth());
    }, [dispatch]);

    return (
        <SidebarProvider>
            <ScrollToTop />
            <div className="min-h-screen bg-background">
                <Header />
                <main>
                    <AppRoutes />
                </main>
                {!isTutorPage && <Footer />}
            </div>
        </SidebarProvider>
    );
}

export default App;

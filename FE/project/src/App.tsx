import { AppRoutes } from '@/routes/AppRoutes';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ScrollToTop } from "@/hooks/ScrollToTop";
import { Toaster } from "@/components/ui/toaster.tsx";

function App() {
    return (
        <SidebarProvider>
            <ScrollToTop />
            <div className="min-h-screen bg-background">
                <Header />
                <main>
                    <AppRoutes />
                    <Toaster />
                </main>
                <Footer />
            </div>
        </SidebarProvider>
    );
}

export default App;

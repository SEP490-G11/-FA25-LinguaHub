import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import { useSidebar } from '@/contexts/SidebarContext';

const AdminLayout: React.FC = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar isOpen={isOpen} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 pt-16 ${
            isOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="p-6 min-h-[calc(100vh-64px-80px)]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;

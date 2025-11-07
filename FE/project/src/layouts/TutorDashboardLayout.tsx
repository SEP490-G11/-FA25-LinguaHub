import React from 'react';
import { Outlet } from 'react-router-dom';
import TutorSidebar from '@/layouts/TutorSidebar';
import { useSidebar } from '@/contexts/SidebarContext';

const TutorDashboardLayout: React.FC = () => {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TutorSidebar isOpen={isOpen} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 min-h-screen ${
          isOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TutorDashboardLayout;

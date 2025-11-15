import React from 'react';

const AdminFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} LinguaHub Admin Panel. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-purple-400 transition-colors">
              Hỗ trợ
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Tài liệu
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;

import React from 'react';
import { ChangePasswordForm } from './components/sections/change-password-form';
import { ChangePasswordHeader } from './components/sections/change-password-header';

const ChangePassword = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ChangePasswordHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default ChangePassword;

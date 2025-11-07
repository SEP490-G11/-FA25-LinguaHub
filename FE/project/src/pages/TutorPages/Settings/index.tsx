import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TutorSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Settings features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorSettings;

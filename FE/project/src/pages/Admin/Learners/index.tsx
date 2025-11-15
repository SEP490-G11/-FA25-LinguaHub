import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminLearners: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người học</h1>
        <p className="text-gray-600 mt-1">Quản lý danh sách và thông tin người học</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Learners management will be implemented here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLearners;

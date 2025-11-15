import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminCourses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khóa học</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả khóa học trên hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khóa học</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Courses management will be implemented here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCourses;

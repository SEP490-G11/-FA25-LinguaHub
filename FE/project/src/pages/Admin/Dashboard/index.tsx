import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileCheck, CreditCard } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Tổng người học',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Tổng khóa học',
      value: '456',
      icon: BookOpen,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Chờ duyệt',
      value: '23',
      icon: FileCheck,
      color: 'bg-yellow-500',
      change: '-5%',
    },
    {
      title: 'Doanh thu tháng',
      value: '₫125M',
      icon: CreditCard,
      color: 'bg-purple-500',
      change: '+18%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Chào mừng đến với trang quản trị LinguaHub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1">
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  {' '}so với tháng trước
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Dashboard management will be implemented here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

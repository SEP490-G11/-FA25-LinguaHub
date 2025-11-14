import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';
import { CourseStats } from '../types';

interface StatsCardsProps {
  stats: CourseStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Tổng khóa học</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Đã duyệt</p>
              <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Chờ duyệt</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-full">
              <Clock className="w-8 h-8 text-yellow-700" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Từ chối</p>
              <p className="text-3xl font-bold text-purple-900">{stats.rejected}</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-full">
              <XCircle className="w-8 h-8 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

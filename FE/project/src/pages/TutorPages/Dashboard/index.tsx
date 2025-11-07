import React from 'react';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Star,
} from 'lucide-react';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-5 w-5 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'} flex items-center gap-1 mt-1`}>
            <TrendingUp className={`h-3 w-3 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const TutorDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock data
  const stats = {
    totalCourses: 12,
    totalStudents: 245,
    monthlyEarnings: '$3,450',
    averageRating: 4.8,
  };

  const recentActivities = [
    { id: 1, student: 'John Doe', course: 'English for Beginners', action: 'Enrolled', time: '2 hours ago' },
    { id: 2, student: 'Jane Smith', course: 'Advanced Spanish', action: 'Completed Lesson 5', time: '5 hours ago' },
    { id: 3, student: 'Mike Johnson', course: 'French Basics', action: 'Left a Review', time: '1 day ago' },
  ];

  const upcomingSessions = [
    { id: 1, student: 'John Doe', course: 'English for Beginners', time: 'Today, 2:00 PM' },
    { id: 2, student: 'Jane Smith', course: 'Advanced Spanish', time: 'Today, 4:30 PM' },
    { id: 3, student: 'Mike Johnson', course: 'French Basics', time: 'Tomorrow, 10:00 AM' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.fullName || user?.username}! 👋
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your courses today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          trend="+2 this month"
          trendUp={true}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          trend="+18 this month"
          trendUp={true}
        />
        <StatCard
          title="Monthly Earnings"
          value={stats.monthlyEarnings}
          icon={DollarSign}
          trend="+12% from last month"
          trendUp={true}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          icon={Star}
          trend="0.2 increase"
          trendUp={true}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                    <p className="text-sm text-gray-600">{activity.action} - {activity.course}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.student}</p>
                      <p className="text-sm text-gray-600">{session.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" />
            Create New Course
          </button>
          <button className="py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Session
          </button>
          <button className="py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <Award className="h-4 w-4" />
            View Achievements
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorDashboard;

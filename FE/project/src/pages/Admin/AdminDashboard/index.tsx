import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, UserCheck, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRole } from '@/auth';

export default function AdminDashboard() {
  // Role check - Chỉ Admin
  const { isAuthorized } = useRole(['Admin']);

  if (!isAuthorized) return null;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage platform users, courses, and approvals</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Users
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Courses
              </CardTitle>
              <BookOpen className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Published courses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Approvals
              </CardTitle>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Courses + Tutors</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Tutors
              </CardTitle>
              <UserCheck className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Verified tutors</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/course-approval">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Review Pending Courses
                  </Button>
                </Link>
                <Link to="/admin/tutor-approval">
                  <Button variant="outline" className="w-full">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Review Tutor Applications
                  </Button>
                </Link>
                <Link to="/admin/users">
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link to="/admin/courses">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View All Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No recent activity</p>
                  <p className="text-sm text-gray-400">
                    System activity will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* System Overview */}
        <motion.div
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-slate-700 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">📊 Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">User Management</h3>
                  <p className="text-sm text-white/80">
                    Monitor and manage all platform users including learners, tutors, and administrators
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Content Moderation</h3>
                  <p className="text-sm text-white/80">
                    Review and approve courses and tutor applications to maintain quality standards
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Analytics & Reports</h3>
                  <p className="text-sm text-white/80">
                    Track platform performance, user engagement, and revenue metrics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

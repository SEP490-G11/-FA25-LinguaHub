import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, DollarSign, Plus, TrendingUp, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRole } from '@/auth';

export default function TutorDashboard() {
  // Role check - Chỉ Tutor
  const { isAuthorized } = useRole(['Tutor']);

  if (!isAuthorized) return null;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tutor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage your courses, students, and earnings</p>
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
                My Courses
              </CardTitle>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Total courses created</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Students
              </CardTitle>
              <Users className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Enrolled students</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Sessions
              </CardTitle>
              <Calendar className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-1">Sessions this week</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Earnings
              </CardTitle>
              <DollarSign className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">0 VND</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/tutor/create-courses">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Course
                  </Button>
                </Link>
                <Link to="/tutor/courses">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View My Courses
                  </Button>
                </Link>
                <Link to="/tutor/students">
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Students
                  </Button>
                </Link>
                <Link to="/tutor/schedule">
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No recent activity yet</p>
                  <p className="text-sm text-gray-400">
                    Start by creating your first course!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Getting Started Guide */}
        <motion.div
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">🚀 Getting Started as a Tutor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Create Your Course</h3>
                    <p className="text-sm text-white/80">
                      Design engaging courses with videos, reading materials, and resources
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Set Your Schedule</h3>
                    <p className="text-sm text-white/80">
                      Configure your availability and booking plans
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Engage Students</h3>
                    <p className="text-sm text-white/80">
                      Interact with learners and track their progress
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Users,
  Star,
  DollarSign,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  createdAt: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'disabled';
  students: number;
  rating: number;
  reviews: number;
}

const mockCourses: Course[] = [
  {
    id: 'COURSE_1704123456789',
    title: 'Advanced English Business Communication',
    category: 'English',
    description: 'Comprehensive course for professionals looking to improve their business English skills.',
    price: 750000,
    duration: '12 weeks',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'approved',
    students: 45,
    rating: 4.8,
    reviews: 23
  },
  {
    id: 'COURSE_1704123456790',
    title: 'English Conversation for Beginners',
    category: 'English',
    description: 'Perfect course for beginners who want to start speaking English confidently.',
    price: 450000,
    duration: '8 weeks',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: '2024-01-14T14:20:00Z',
    status: 'pending',
    students: 0,
    rating: 0,
    reviews: 0
  },
  {
    id: 'COURSE_1704123456791',
    title: 'IELTS Speaking Preparation',
    category: 'English',
    description: 'Intensive IELTS speaking preparation course with mock tests.',
    price: 680000,
    duration: '10 weeks',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: '2024-01-13T09:15:00Z',
    status: 'approved',
    students: 32,
    rating: 4.9,
    reviews: 18
  },
  {
    id: 'COURSE_1704123456792',
    title: 'Korean Language Fundamentals',
    category: 'Korean',
    description: 'Learn Korean from scratch with systematic approach to grammar and vocabulary.',
    price: 550000,
    duration: '16 weeks',
    image: 'https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: '2024-01-12T16:45:00Z',
    status: 'draft',
    students: 0,
    rating: 0,
    reviews: 0
  },
  {
    id: 'COURSE_1704123456793',
    title: 'Japanese for Travel',
    category: 'Japanese',
    description: 'Essential Japanese phrases and cultural insights for travelers.',
    price: 400000,
    duration: '6 weeks',
    image: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
    createdAt: '2024-01-11T11:20:00Z',
    status: 'rejected',
    students: 0,
    rating: 0,
    reviews: 0
  },
];

const getStatusConfig = (status: string) => {
  const configs = {
    draft: {
      icon: AlertCircle,
      label: 'Draft',
      className: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    pending: {
      icon: Clock,
      label: 'Pending Review',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 border-red-200'
    },
    disabled: {
      icon: XCircle,
      label: 'Disabled',
      className: 'bg-gray-100 text-gray-500 border-gray-200'
    }
  };
  return configs[status as keyof typeof configs] || configs.draft;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
};

const CourseList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter courses
  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  // Get unique categories
  const categories = Array.from(new Set(mockCourses.map(c => c.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Quản lý khóa học
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi tất cả các khóa học của bạn
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to="/tutor/create-courses">
                <Plus className="w-5 h-5" />
                Tạo khóa học mới
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng khóa học</p>
                    <p className="text-2xl font-bold">{mockCourses.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đã duyệt</p>
                    <p className="text-2xl font-bold text-green-600">
                      {mockCourses.filter(c => c.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Chờ duyệt</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {mockCourses.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng học viên</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {mockCourses.reduce((sum, c) => sum + c.students, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm khóa học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Grid */}
        {paginatedCourses.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy khóa học
              </h3>
              <p className="text-gray-600 mb-6">
                Không có khóa học nào phù hợp với bộ lọc của bạn
              </p>
              <Button asChild>
                <Link to="/tutor/create-courses">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khóa học đầu tiên
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course, index) => {
                const statusConfig = getStatusConfig(course.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      {/* Course Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className={statusConfig.className + ' border'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="flex-1 flex flex-col p-4">
                        {/* Course Header */}
                        <div className="mb-3">
                          <Badge variant="outline" className="mb-2">
                            {course.category}
                          </Badge>
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                        </div>

                        {/* Course Stats */}
                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold text-blue-600">
                              {formatPrice(course.price)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{course.students} học viên</span>
                          </div>
                          
                          {course.rating > 0 && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>
                                {course.rating} ({course.reviews} đánh giá)
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(course.createdAt)}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto space-y-2">
                          <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="w-full"
                          >
                            <Link to={`/tutor/courses/${course.id}/content`}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Quản lý khóa học
                            </Link>
                          </Button>
                          
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Link to={`/courses/${course.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Xem khóa học
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseList;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Users,
  Star,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Loader
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import courseApi from '@/features/learner/queries/course-api';

interface Course {
  id?: string | number;
  courseID?: number;
  title: string;
  category?: string;
  categoryID?: number;
  description: string;
  price: number;
  duration: number; // in hours
  image?: string;
  thumbnailURL?: string;
  createdAt?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'disabled';
  students?: number;
  rating?: number;
  reviews?: number;
  language?: string;
}

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
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 6;

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Debug: Check if token exists
        const token = localStorage.getItem('access_token');
        console.log('[CourseList] Token exists:', !!token);
        console.log('[CourseList] Token value:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        
        if (!token) {
          setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem khóa học.');
          setLoading(false);
          return;
        }
        
        const courses = await courseApi.getMyCourses();
        console.log('[CourseList] Raw API Response:', JSON.stringify(courses, null, 2));
        
        // Map backend response to frontend interface
        const mappedCourses = (Array.isArray(courses) ? courses : []).map((course: any) => {
          console.log('[CourseList] Mapping course:', course);
          return {
            id: course.id || course.courseID,
            courseID: course.courseID || course.id,
            title: course.title || '',
            description: course.description || '',
            price: course.price || 0,
            duration: course.duration || 0,
            categoryID: course.categoryID,
            language: course.language,
            thumbnailURL: course.thumbnailURL || course.image,
            createdAt: course.createdAt,
            status: (course.status || 'Draft')?.toLowerCase(),
            students: course.students || 0,
            rating: course.rating || 0,
            reviews: course.reviews || 0,
          };
        });
        
        console.log('[CourseList] Mapped courses:', mappedCourses);
        setAllCourses(mappedCourses);
      } catch (err) {
        console.error('[CourseList] Error fetching courses:', err);
        
        // More specific error messages
        let errorMessage = 'Không thể tải danh sách khóa học. Vui lòng thử lại.';
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (err.message.includes('403')) {
            errorMessage = 'Bạn không có quyền truy cập.';
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || course.language === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  // Get unique languages from fetched courses
  const languages = Array.from(new Set(allCourses.map(c => c.language).filter(Boolean)));

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Lỗi</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex-1"
              >
                Thử lại
              </Button>
              {error.includes('chưa đăng nhập') && (
                <Button 
                  onClick={() => navigate('/signin')}
                  className="flex-1"
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <p className="text-2xl font-bold">{allCourses.length}</p>
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
                      {allCourses.filter(c => c.status === 'approved').length}
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
                      {allCourses.filter(c => c.status === 'pending').length}
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
                      {allCourses.reduce((sum, c) => sum + (c.students || 0), 0)}
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
                    <SelectValue placeholder="Ngôn ngữ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
                    {languages.map(language => (
                      <SelectItem key={language} value={language || ''}>
                        {language}
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
                const statusConfig = getStatusConfig(course.status || 'draft');
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={course.id || course.courseID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      {/* Course Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.thumbnailURL || course.image || 'https://via.placeholder.com/400x300'}
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
                            <span>{course.duration} hours</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{course.students || 0} học viên</span>
                          </div>
                          
                          {(course.rating || 0) > 0 && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>
                                {course.rating} ({course.reviews} đánh giá)
                              </span>
                            </div>
                          )}
                          
                          {course.createdAt && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(course.createdAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto">
                          <Button
                            asChild
                            variant="default"
                            size="sm"
                            className="w-full"
                          >
                            <Link to={`/tutor/courses/${course.id || course.courseID}/content`}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Quản lý khóa học
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

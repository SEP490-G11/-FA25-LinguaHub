import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllCourses, CourseListItem } from './course-list-api';
import { CourseCard, StatsCards, CourseFilters, CoursePagination } from './components';
import { CourseStats } from './types';

const CourseList = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State for API data
  const [allCourses, setAllCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const coursesData = await getAllCourses();
      setAllCourses(coursesData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khóa học');
      setAllCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Client-side filtering
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || course.categoryName === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats from all courses
  const stats: CourseStats = {
    total: allCourses.length,
    approved: allCourses.filter(c => c.status === 'Approved').length,
    pending: allCourses.filter(c => c.status === 'Pending').length,
    rejected: allCourses.filter(c => c.status === 'Rejected').length,
  };

  // Get unique categories from courses
  const categories = Array.from(new Set(allCourses.map(c => c.categoryName)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản lý khóa học
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi tất cả các khóa học của bạn
              </p>
            </div>
            <Button asChild size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <Link to="/tutor/create-courses">
                <Plus className="w-5 h-5" />
                Tạo khóa học mới
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Filters */}
          <CourseFilters
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            selectedCategory={selectedCategory}
            categories={categories}
            onSearchChange={setSearchTerm}
            onStatusChange={setSelectedStatus}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchCourses}
                  className="ml-auto"
                >
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải khóa học...</p>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && paginatedCourses.length === 0 ? (
          <Card className="p-12 shadow-lg">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy khóa học
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                  ? 'Không có khóa học nào phù hợp với bộ lọc của bạn'
                  : 'Bạn chưa có khóa học nào'}
              </p>
              <Button asChild className="gap-2">
                <Link to="/tutor/create-courses">
                  <Plus className="w-4 h-4" />
                  Tạo khóa học đầu tiên
                </Link>
              </Button>
            </div>
          </Card>
        ) : !isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>

            {/* Pagination */}
            <CoursePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCourses.length}
              onPageChange={setCurrentPage}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CourseList;

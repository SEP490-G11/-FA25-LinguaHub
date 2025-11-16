import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CheckCircle2, Filter, BookOpen } from 'lucide-react';
import { courseApprovalApi } from './api';
import { PendingCourse } from './types';
import { Filters, CourseCard, Pagination } from './components';

export default function CourseApprovalPage() {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchCourses = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {};
      if (searchQuery.trim()) {
        filters.search = searchQuery;
      }
      if (selectedCategory && selectedCategory !== 'all') {
        filters.categoryID = parseInt(selectedCategory);
      }

      const response = await courseApprovalApi.getPendingCourses(page, limit, filters);
      setCourses(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khóa học');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== STICKY HEADER ========== */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        {/* Gradient Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-[1600px] mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Phê duyệt khóa học</h1>
                  <p className="text-blue-100 text-sm">Quản lý và duyệt khóa học từ giảng viên</p>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-lg px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <div>
                    <p className="text-blue-100 text-xs font-medium">Chờ phê duyệt</p>
                    <p className="text-2xl font-bold text-white">{total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <Filters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                variant="outline"
                size="sm"
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Đang tải khóa học...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có khóa học chờ duyệt
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedCategory !== 'all'
                ? 'Không tìm thấy khóa học phù hợp'
                : 'Tất cả khóa học đã được xem xét'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              limit={limit}
              isLoading={isLoading}
              onPageChange={fetchCourses}
            />
          </>
        )}
      </div>
    </div>
  );
}

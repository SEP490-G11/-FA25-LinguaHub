import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CheckCircle2, Filter, FileEdit, ArrowLeft } from 'lucide-react';
import axios from '@/config/axiosConfig';
import { PendingCourse, PaginatedResponse, ApprovalFilters } from './types';
import { Filters, CourseCard, Pagination } from './components';

export default function DraftListPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<PendingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchDrafts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch draft courses with PENDING_REVIEW status
      const response = await axios.get('/admin/courses/drafts', {
        params: { status: 'PENDING_REVIEW' }
      });

      let draftCourses = response?.data?.result || [];

      // Map to PendingCourse format
      let allDrafts: PendingCourse[] = draftCourses.map((draft: any) => ({
        id: draft.draftID,
        title: draft.title,
        shortDescription: draft.shortDescription || '',
        description: draft.description || '',
        requirement: draft.requirement || '',
        level: draft.level || 'BEGINNER',
        categoryID: 0,
        categoryName: draft.categoryName || 'Unknown',
        language: draft.language || 'English',
        duration: draft.duration || 0,
        price: draft.price || 0,
        thumbnailURL: draft.thumbnailURL || '',
        status: 'Pending Review', // Draft courses have "Pending Review" status
        tutorID: 0,
        tutorName: draft.tutorName,
        tutorEmail: draft.tutorEmail,
        createdAt: draft.createdAt || new Date().toISOString(),
        updatedAt: draft.updatedAt || new Date().toISOString(),
        isDraft: true,
      }));

      // Apply filters
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        allDrafts = allDrafts.filter(
          (draft) =>
            draft.title.toLowerCase().includes(searchLower) ||
            draft.tutorName?.toLowerCase().includes(searchLower)
        );
      }

      if (selectedCategory && selectedCategory !== 'all') {
        allDrafts = allDrafts.filter(
          (draft) => draft.categoryID === parseInt(selectedCategory)
        );
      }

      // Sort by createdAt (newest first)
      allDrafts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply pagination
      const totalCount = allDrafts.length;
      const pages = Math.ceil(totalCount / limit);
      const startIndex = (page - 1) * limit;
      const paginatedDrafts = allDrafts.slice(startIndex, startIndex + limit);

      setDrafts(paginatedDrafts);
      setTotalPages(pages);
      setTotal(totalCount);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('❌ Error fetching draft courses:', err);
      
      // Handle specific error cases
      if (err?.response?.status === 403) {
        setError('Bạn không có quyền truy cập trang này');
        // Redirect to dashboard after showing error
        setTimeout(() => navigate('/admin/dashboard'), 2000);
      } else if (err?.response?.status === 404) {
        setError('Không tìm thấy danh sách khóa học cập nhật');
      } else if (!err?.response) {
        setError('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn');
      } else {
        setError(err?.response?.data?.message || err.message || 'Không thể tải danh sách khóa học cập nhật');
      }
      
      setDrafts([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts(1);
  }, [searchQuery, selectedCategory]);

  const handleDraftClick = (draftId: number) => {
    navigate(`/admin/course-approval/drafts/${draftId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== STICKY HEADER ========== */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        {/* Gradient Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-[1600px] mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/admin/course-approval')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <FileEdit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Phê duyệt cập nhật khóa học</h1>
                  <p className="text-blue-100 text-sm">Xem xét các bản cập nhật từ giảng viên</p>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-lg px-5 py-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-300" />
                  <div>
                    <p className="text-blue-100 text-xs font-medium">Pending Review</p>
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
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3 justify-between">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Lỗi tải dữ liệu</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-600 hover:text-red-800 flex-shrink-0"
                aria-label="Đóng thông báo lỗi"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => fetchDrafts(currentPage)}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Thử lại
              </Button>
              <Button
                onClick={() => navigate('/admin/course-approval')}
                size="sm"
                variant="ghost"
                className="text-red-700 hover:bg-red-100"
              >
                Quay lại trang chính
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Đang tải khóa học cập nhật...</p>
            </div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có khóa học cập nhật nào đang Pending Review
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedCategory !== 'all'
                ? 'Không tìm thấy khóa học phù hợp'
                : 'Tất cả bản cập nhật đã được xem xét'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
              {drafts.map((draft) => (
                <div key={draft.id} onClick={() => handleDraftClick(draft.id)}>
                  <CourseCard course={draft} />
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              limit={limit}
              isLoading={isLoading}
              onPageChange={fetchDrafts}
            />
          </>
        )}
      </div>
    </div>
  );
}

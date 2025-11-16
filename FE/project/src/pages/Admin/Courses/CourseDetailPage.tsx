import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Star, Users, Calendar, Clock } from 'lucide-react';
import { coursesApi } from './api';
import type { Course } from './types';

// Reuse CourseContentSection from CourseApproval
import { CourseContentSection } from '../CourseApproval/components/course-content-section';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getCourseDetail(courseId!);
      console.log('📚 Course detail loaded:', {
        title: data.title,
        status: data.status,
        hasSections: !!data.section,
        sectionsCount: data.section?.length || 0,
        adminNotes: data.adminNotes,
        hasAdminNotes: !!data.adminNotes
      });
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Không tìm thấy khóa học</p>
          <button
            onClick={() => navigate('/admin/courses')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    const statusUpper = status?.toUpperCase();
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
      DISABLED: { label: 'Vô hiệu', className: 'bg-gray-100 text-gray-600' },
    };

    const config = statusConfig[statusUpper || 'DRAFT'] || statusConfig.DRAFT;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                {getStatusBadge(course.status)}
              </div>
              <p className="text-gray-600">{course.shortDescription}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail */}
            {course.thumbnailURL && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-md p-8">
              {/* Badges */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {course.level || 'BEGINNER'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {course.categoryName || course.category || 'N/A'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {course.language || 'English'}
                </span>
              </div>

              {/* Title & Short Description */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h2>

              <p className="text-gray-600 text-lg mb-6">
                {course.shortDescription}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Giảng viên</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {course.tutorName || 'N/A'}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Thời lượng</span>
                  </div>
                  <p className="font-semibold text-gray-900">{course.duration || 0}h</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Đánh giá</span>
                  </div>
                  <p className="font-semibold text-gray-900">{course.rating || 'N/A'}</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Giá</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {course.price?.toLocaleString()} đ
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Mô tả chi tiết
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Requirements */}
              {course.requirement && (
                <>
                  <div className="border-t border-gray-200 my-6"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Yêu cầu
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {course.requirement}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Learning Objectives */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Mục tiêu học tập ({course.objectives.length})
                </h3>
                <ul className="space-y-3">
                  {course.objectives.map((objective: any) => (
                    <li
                      key={objective.objectiveID}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                      <span>{objective.objectiveText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Content */}
            {course.section && course.section.length > 0 ? (
              <CourseContentSection course={course as any} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Nội dung khóa học</h2>
                <p className="text-gray-500">Chưa có nội dung</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutor Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Giảng viên</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {course.tutorName?.charAt(0) || 'T'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{course.tutorName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Tutor ID: {course.tutorID}</p>
                </div>
              </div>
            </div>

            {/* Admin Review Note */}
            {course.adminNotes && (course.status?.toUpperCase() === 'APPROVED' || course.status?.toUpperCase() === 'REJECTED') && (
              <div className={`rounded-lg shadow-sm p-6 ${
                course.status?.toUpperCase() === 'APPROVED'
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {course.status?.toUpperCase() === 'APPROVED' ? (
                    <>
                      <span className="text-green-700">✓ Ghi chú phê duyệt</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-700">✗ Lý do từ chối</span>
                    </>
                  )}
                </h3>
                <p className={`text-sm whitespace-pre-wrap ${
                  course.status?.toUpperCase() === 'APPROVED' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {course.adminNotes}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Thông tin khác</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Tạo: {course.createdAt ? new Date(course.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                {course.updatedAt && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Cập nhật: {new Date(course.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

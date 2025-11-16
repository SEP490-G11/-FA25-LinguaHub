import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  BookOpen,
  Target,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { courseApprovalApi } from './api';
import { CourseDetail } from './types';
import { CourseContentSection } from './components/course-content-section';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Fetch course detail
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check if it's a draft (URL param or localStorage)
        const isDraft = new URLSearchParams(window.location.search).get('isDraft') === 'true';
        
        const courseDetail = await courseApprovalApi.getCourseDetail(
          parseInt(courseId),
          isDraft
        );
        setCourse(courseDetail);
      } catch (err: any) {
        setError(err.message || 'Không thể tải chi tiết khóa học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleApprove = async () => {
    if (!course) return;

    try {
      setIsActionLoading(true);
      await courseApprovalApi.approveCourse(
        course.id,
        course.isDraft || false,
        adminNotes
      );

      setActionType('approve');
      setShowSuccessModal(true);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể phê duyệt khóa học',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!course) return;

    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
      });
      return;
    }

    try {
      setIsActionLoading(true);
      await courseApprovalApi.rejectCourse(
        course.id,
        course.isDraft || false,
        rejectionReason
      );

      setActionType('reject');
      setShowSuccessModal(true);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể từ chối khóa học',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải chi tiết khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/course-approval')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-800 font-semibold text-lg mb-2">
                  {error || 'Không tìm thấy khóa học'}
                </p>
                <Button onClick={() => window.location.reload()} size="sm">
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.section?.reduce(
    (sum, section) => sum + (section.lessons?.length || 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-600 text-white py-8 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/course-approval')}
            className="mb-4 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Button>

          <h1 className="text-4xl font-bold mb-2">Chi tiết khóa học</h1>
          <p className="text-blue-100">Xem xét và phê duyệt khóa học</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
              <div className="flex gap-2 mb-4 flex-wrap">
                <Badge className="text-sm">{course.level}</Badge>
                <Badge variant="outline" className="text-sm">{course.categoryName}</Badge>
                <Badge variant="outline" className="text-sm">{course.language}</Badge>
                {course.isDraft && (
                  <Badge className="bg-purple-500 text-sm">Draft</Badge>
                )}
              </div>

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
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Giảng viên</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {course.tutorName || `Tutor #${course.tutorID}`}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Thời lượng</span>
                  </div>
                  <p className="font-semibold text-gray-900">{course.duration}h</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Bài học</span>
                  </div>
                  <p className="font-semibold text-gray-900">{totalLessons}</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Giá</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatPrice(course.price)}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Mô tả chi tiết
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Requirements */}
              {course.requirement && (
                <>
                  <Separator className="my-6" />
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Mục tiêu học tập ({course.objectives.length})
                </h3>
                <ul className="space-y-3">
                  {course.objectives.map((objective) => (
                    <li
                      key={objective.objectiveID}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{objective.objectiveText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Content */}
            <CourseContentSection course={course} />
          </div>

          {/* Sidebar - Admin Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hành động Admin
              </h3>

              {!showRejectForm ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminNotes" className="text-sm font-semibold">
                      Ghi chú cho giảng viên (tùy chọn)
                    </Label>
                    <Textarea
                      id="adminNotes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Nhập ghi chú hoặc góp ý..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={handleApprove}
                    disabled={isActionLoading}
                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                    size="lg"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Phê duyệt khóa học
                  </Button>

                  <Button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isActionLoading}
                    variant="destructive"
                    className="w-full gap-2"
                    size="lg"
                  >
                    <XCircle className="w-4 h-4" />
                    Từ chối khóa học
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="rejectionReason"
                      className="text-sm font-semibold text-red-600"
                    >
                      Lý do từ chối *
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do từ chối (bắt buộc)..."
                      rows={5}
                      className="mt-2 border-red-300 focus:border-red-500"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    variant="outline"
                    className="w-full"
                    disabled={isActionLoading}
                  >
                    Hủy
                  </Button>

                  <Button
                    onClick={handleReject}
                    disabled={isActionLoading || !rejectionReason.trim()}
                    variant="destructive"
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Xác nhận từ chối
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md border-0 shadow-lg">
          <DialogHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${
                  actionType === 'approve'
                    ? 'bg-gradient-to-br from-green-100 to-green-50'
                    : 'bg-gradient-to-br from-red-100 to-red-50'
                }`}
              >
                {actionType === 'approve' ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {actionType === 'approve'
                ? '✅ Khóa học đã được phê duyệt!'
                : '❌ Khóa học đã bị từ chối'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              {actionType === 'approve'
                ? 'Khóa học đã được phê duyệt và sẽ hiển thị cho học viên.'
                : 'Khóa học đã bị từ chối. Giảng viên sẽ nhận được thông báo.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div
              className={`p-4 rounded-lg border ${
                actionType === 'approve'
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              }`}
            >
              <p className="text-sm text-gray-600 mb-1">📚 Tên khóa học</p>
              <p className="font-semibold text-gray-900 text-lg">
                {course?.title}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                actionType === 'approve'
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              }`}
            >
              <p className="text-sm text-gray-600 mb-1">👨‍🏫 Giảng viên</p>
              <p className="font-semibold text-gray-900">
                {course?.tutorName || `Tutor #${course?.tutorID}`}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                actionType === 'approve'
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              }`}
            >
              <p className="text-sm text-gray-600 mb-1">📊 Trạng thái</p>
              <p
                className={`font-semibold ${
                  actionType === 'approve' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {actionType === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối'}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/admin/course-approval');
              }}
              className={`flex-1 font-semibold ${
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              Quay lại danh sách
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

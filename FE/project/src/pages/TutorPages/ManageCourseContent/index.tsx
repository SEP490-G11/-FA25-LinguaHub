import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  getCourseDetail,
  updateCourse,
  updateSection,
  updateLesson,
  updateResource,
  deleteSection,
  deleteLesson,
  deleteResource,
} from './manage-course-api';
import { CourseDetail, Section, Lesson, Resource } from './types';
import { ManageCourseInfo, ManageCourseContentComponent } from './components';

const ManageCourseContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ========== MAIN STATES ==========
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ========== FETCH COURSE DATA ==========
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);

        const courseData = await getCourseDetail(parseInt(courseId));
        console.log('=== COURSE DATA FETCHED ===');
        console.log('Full course:', courseData);
        console.log('Has section?', !!courseData?.section);
        console.log('Is section array?', Array.isArray(courseData?.section));
        console.log('Section length:', courseData?.section?.length);
        console.log('Section data:', courseData?.section);
        if (courseData?.section && courseData.section.length > 0) {
          console.log('First section:', courseData.section[0]);
          console.log('First section lessons:', courseData.section[0].lessons);
        }
        
        // Ensure section is always an array
        const normalizedCourse = {
          ...courseData,
          section: Array.isArray(courseData?.section) ? courseData.section : []
        };
        setCourse(normalizedCourse);
      } catch (err: any) {
        console.error('=== ERROR FETCHING COURSE ===', err);
        setError(err.message || 'Không thể tải thông tin khóa học');
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // ========== STEP 1: UPDATE COURSE INFO ==========
  const handleStep1Save = async (courseData: Partial<CourseDetail>) => {
    if (!courseId || !course) return;

    setIsSaving(true);
    try {
      const updated = await updateCourse(parseInt(courseId), {
        title: courseData.title || course.title,
        description: courseData.description || course.description,
        duration: courseData.duration || course.duration,
        price: courseData.price || course.price,
        language: courseData.language || course.language,
        thumbnailURL: courseData.thumbnailURL || course.thumbnailURL,
        categoryID: 1, // TODO: Get from form
      });

      setCourse(updated);
      toast({
        title: 'Thành công',
        description: 'Thông tin khóa học đã được cập nhật',
      });

      setCurrentStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi cập nhật khóa học';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ========== STEP 2: UPDATE SECTIONS/LESSONS/RESOURCES ==========
  const handleStep2UpdateSection = async (sectionIndex: number, sectionData: Section) => {
    if (!course) return;

    setIsSaving(true);
    try {
      const updated = await updateSection(sectionData.sectionID, {
        title: sectionData.title,
        description: sectionData.description,
        orderIndex: sectionData.orderIndex,
      });

      const newSections = [...course.section];
      newSections[sectionIndex] = updated;
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Chương đã được cập nhật',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi cập nhật chương';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2UpdateLesson = async (sectionIndex: number, lessonIndex: number, lessonData: Lesson) => {
    if (!course) return;

    setIsSaving(true);
    try {
      const updated = await updateLesson(lessonData.lessonID, {
        title: lessonData.title,
        duration: lessonData.duration,
        lessonType: lessonData.lessonType,
        videoURL: lessonData.videoURL || '',
        content: lessonData.content || '',
        orderIndex: lessonData.orderIndex,
      });

      const newSections = [...course.section];
      newSections[sectionIndex].lessons[lessonIndex] = updated;
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Bài học đã được cập nhật',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi cập nhật bài học';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2UpdateResource = async (
    sectionIndex: number,
    lessonIndex: number,
    resourceIndex: number,
    resourceData: Resource
  ) => {
    if (!course) return;

    setIsSaving(true);
    try {
      const updated = await updateResource(resourceData.resourceID, {
        resourceType: resourceData.resourceType,
        resourceTitle: resourceData.resourceTitle,
        resourceURL: resourceData.resourceURL,
      });

      const newSections = [...course.section];
      newSections[sectionIndex].lessons[lessonIndex].resources[resourceIndex] = updated;
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được cập nhật',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi cập nhật tài liệu';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2DeleteSection = async (sectionIndex: number) => {
    if (!course || !confirm('Bạn chắc chắn muốn xóa chương này?')) return;

    const sectionId = course.section[sectionIndex].sectionID;
    setIsSaving(true);

    try {
      await deleteSection(sectionId);

      const newSections = course.section.filter((_, i) => i !== sectionIndex);
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Chương đã được xóa',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi xóa chương';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2DeleteLesson = async (sectionIndex: number, lessonIndex: number) => {
    if (!course || !confirm('Bạn chắc chắn muốn xóa bài học này?')) return;

    const lessonId = course.section[sectionIndex].lessons[lessonIndex].lessonID;
    setIsSaving(true);

    try {
      await deleteLesson(lessonId);

      const newSections = [...course.section];
      newSections[sectionIndex].lessons = newSections[sectionIndex].lessons.filter(
        (_, i) => i !== lessonIndex
      );
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Bài học đã được xóa',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi xóa bài học';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2DeleteResource = async (
    sectionIndex: number,
    lessonIndex: number,
    resourceIndex: number
  ) => {
    if (!course || !confirm('Bạn chắc chắn muốn xóa tài liệu này?')) return;

    const resourceId = course.section[sectionIndex].lessons[lessonIndex].resources[resourceIndex].resourceID;
    setIsSaving(true);

    try {
      await deleteResource(resourceId);

      const newSections = [...course.section];
      newSections[sectionIndex].lessons[lessonIndex].resources = newSections[sectionIndex].lessons[
        lessonIndex
      ].resources.filter((_, i) => i !== resourceIndex);
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được xóa',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi xóa tài liệu';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/courses')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>

          <Card className="p-8 bg-red-50 border-red-200">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-red-600 text-lg font-semibold mb-4">
                  {error || 'Không tìm thấy khóa học'}
                </p>
                <Button onClick={() => window.location.reload()} size="sm">
                  Thử lại
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ========== SUCCESS MODAL ==========
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/courses');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/courses')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách khóa học
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản lý nội dung khóa học
              </h1>
              <p className="text-gray-600">
                Chỉnh sửa thông tin, chương, bài học và tài liệu của khóa học
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-md">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle2 className="w-6 h-6" /> : '1'}
                </div>
                <span className="mt-2 text-sm font-medium">Thông tin khóa học</span>
              </div>

              <div
                className={`h-1 flex-1 mx-4 ${
                  currentStep > 1 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === 2
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  2
                </div>
                <span className="mt-2 text-sm font-medium">Nội dung khóa học</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1
                ? 'Bước 1: Thông tin khóa học'
                : 'Bước 2: Quản lý nội dung'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <ManageCourseInfo
                course={course}
                onSave={handleStep1Save}
                onCancel={() => navigate('/courses')}
                isSubmitting={isSaving}
              />
            )}

            {currentStep === 2 && (
              <ManageCourseContentComponent
                course={course}
                onUpdateSection={handleStep2UpdateSection}
                onUpdateLesson={handleStep2UpdateLesson}
                onUpdateResource={handleStep2UpdateResource}
                onDeleteSection={handleStep2DeleteSection}
                onDeleteLesson={handleStep2DeleteLesson}
                onDeleteResource={handleStep2DeleteResource}
                onBack={() => setCurrentStep(1)}
                onComplete={() => setShowSuccessModal(true)}
                isSubmitting={isSaving}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md border-0 shadow-lg">
          <DialogHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              🎉 Cập nhật thành công!
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Khóa học của bạn đã được cập nhật thành công.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">📚 Tên khóa học</p>
              <p className="font-semibold text-gray-900 text-lg">{course.title}</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">📊 Trạng thái</p>
              <p className="font-semibold text-green-600">{course.status}</p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-6">
            <Button
              onClick={handleCloseSuccessModal}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCourseContent;

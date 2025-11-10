import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
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
  submitCourseForApproval,
} from './edit-course-api';
import { CourseDetail, Section, Lesson, Resource } from './types';
import { EditCourseInfo, EditCourseStructure } from './components';

const EditCourse = () => {
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

  // ========== HELPER: Normalize course data ==========
  const normalizeCourseData = (courseData: CourseDetail): CourseDetail => {
    return {
      ...courseData,
      section: Array.isArray(courseData?.section)
        ? courseData.section.map(section => ({
            ...section,
            lessons: Array.isArray(section.lessons)
              ? section.lessons.map(lesson => ({
                  ...lesson,
                  resources: Array.isArray(lesson.resources)
                    ? lesson.resources
                    : [],
                }))
              : [],
          }))
        : [],
    };
  };

  // ========== FETCH COURSE DATA ==========
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        setError(null);

        const courseData = await getCourseDetail(parseInt(courseId));

        // Normalize all nested arrays
        const normalizedCourse = normalizeCourseData(courseData);
        setCourse(normalizedCourse);
      } catch (err: any) {
        console.error('=== ERROR FETCHING COURSE ===', err);
        setError(
          err.message || 'Unable to load course information'
        );
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // ========== STEP 1: UPDATE COURSE INFO ==========
  const handleStep1Save = async (
    courseData: Partial<CourseDetail>
  ) => {
    if (!courseId || !course) return;

    setIsSaving(true);
    try {
      // Update course info
      await updateCourse(parseInt(courseId), {
        title: courseData.title || course.title,
        description: courseData.description || course.description,
        duration: courseData.duration || course.duration,
        price: courseData.price || course.price,
        language: courseData.language || course.language,
        thumbnailURL:
          courseData.thumbnailURL || course.thumbnailURL,
        categoryID: 1, // TODO: Get from form
      });

      // Re-fetch the complete course data with sections/lessons/resources
      const updated = await getCourseDetail(parseInt(courseId));
      const normalizedCourse = normalizeCourseData(updated);
      setCourse(normalizedCourse);

      toast({
        title: 'Success',
        description: 'Course information has been updated',
      });

      setCurrentStep(2);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update course';
      setError(message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ========== STEP 2: UPDATE SECTIONS/LESSONS/RESOURCES ==========
  const handleStep2UpdateSection = async (
    sectionIndex: number,
    sectionData: Section
  ) => {
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
        title: 'Success',
        description: 'Chapter has been updated',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update chapter';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2UpdateLesson = async (
    sectionIndex: number,
    lessonIndex: number,
    lessonData: Lesson
  ) => {
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
      // Ensure resources array exists in the updated lesson
      newSections[sectionIndex].lessons[lessonIndex] = {
        ...updated,
        resources: Array.isArray(updated.resources) ? updated.resources : [],
      };
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Success',
        description: 'Lesson has been updated',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update lesson';
      toast({
        variant: 'destructive',
        title: 'Error',
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
      newSections[sectionIndex].lessons[lessonIndex].resources[
        resourceIndex
      ] = updated;
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Success',
        description: 'Resource has been updated',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update resource';
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
    if (!course) return;

    const sectionId = course.section[sectionIndex].sectionID;
    setIsSaving(true);

    try {
      await deleteSection(sectionId);

      const newSections = course.section.filter(
        (_, i) => i !== sectionIndex
      );
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Chương đã được xóa',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi xóa chương';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStep2DeleteLesson = async (
    sectionIndex: number,
    lessonIndex: number
  ) => {
    if (!course) return;

    const lessonId =
      course.section[sectionIndex].lessons[lessonIndex].lessonID;
    setIsSaving(true);

    try {
      await deleteLesson(lessonId);

      const newSections = [...course.section];
      newSections[sectionIndex].lessons = newSections[
        sectionIndex
      ].lessons.filter((_, i) => i !== lessonIndex);
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Bài học đã được xóa',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi xóa bài học';
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
    if (!course) return;

    const resourceId =
      course.section[sectionIndex].lessons[lessonIndex].resources[
        resourceIndex
      ].resourceID;
    setIsSaving(true);

    try {
      await deleteResource(resourceId);

      const newSections = [...course.section];
      newSections[sectionIndex].lessons[lessonIndex].resources =
        newSections[sectionIndex].lessons[lessonIndex].resources.filter(
          (_, i) => i !== resourceIndex
        );
      setCourse({ ...course, section: newSections });

      toast({
        title: 'Thành công',
        description: 'Tài liệu đã được xóa',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi xóa tài liệu';
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ========== SUBMIT COURSE ==========
  const handleSubmitCourse = async () => {
    if (!courseId) return;

    setIsSaving(true);
    try {
      await submitCourseForApproval(parseInt(courseId));
      setShowSuccessModal(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Lỗi gửi khóa học';
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
          <p className="text-gray-600 text-lg">
            Đang tải khóa học...
          </p>
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
                <Button
                  onClick={() => window.location.reload()}
                  size="sm"
                >
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
            Back to Course List
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Edit Course
              </h1>
              <p className="text-gray-600">
                {course.title}
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
                  {currentStep > 1 ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    '1'
                  )}
                </div>
                <span className="mt-2 text-sm font-medium">
                  Course Information
                </span>
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
                <span className="mt-2 text-sm font-medium">
                  Course Content
                </span>
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
                ? 'Step 1: Course Information'
                : 'Step 2: Manage Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <EditCourseInfo
                course={course}
                onSave={handleStep1Save}
                isSubmitting={isSaving}
              />
            )}

            {currentStep === 2 && (
              <EditCourseStructure
                course={course}
                onUpdateSection={handleStep2UpdateSection}
                onUpdateLesson={handleStep2UpdateLesson}
                onUpdateResource={handleStep2UpdateResource}
                onDeleteSection={handleStep2DeleteSection}
                onDeleteLesson={handleStep2DeleteLesson}
                onDeleteResource={handleStep2DeleteResource}
                onBack={() => setCurrentStep(1)}
                onSubmit={handleSubmitCourse}
                isSubmitting={isSaving}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      >
        <DialogContent className="sm:max-w-md border-0 shadow-lg">
          <DialogHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              🎉 Update Successful!
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Your course has been updated and submitted successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">
                📚 Course Name
              </p>
              <p className="font-semibold text-gray-900 text-lg">
                {course.title}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">
                📊 Status
              </p>
              <p className="font-semibold text-green-600">
                {course.status}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-6">
            <Button
              onClick={handleCloseSuccessModal}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Back to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditCourse;

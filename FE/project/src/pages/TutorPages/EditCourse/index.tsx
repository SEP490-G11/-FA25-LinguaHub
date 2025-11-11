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
  submitCourseForApproval,
  updateSection,
  updateLesson,
  updateResource,
  deleteSection,
  deleteLesson,
  deleteResource,
  createSection,
  createLesson,
  createResource,
} from './edit-course-api';
import { CourseDetail, Section } from './types';
import { CourseInfoForm, CourseStructureForm, StepIndicator, SectionData } from '@/pages/Shared/CourseForm';
import { CATEGORIES, LANGUAGES } from '@/constants/categories';

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

  // ========== HELPER: Convert Section to SectionData ==========
  const convertToSectionData = (section: Section): SectionData => ({
    sectionID: section.sectionID.toString(),
    courseID: section.courseID,
    title: section.title,
    description: section.description,
    orderIndex: section.orderIndex,
    lessons: (section.lessons || []).map(lesson => ({
      lessonID: lesson.lessonID.toString(),
      sectionID: section.sectionID.toString(),
      title: lesson.title,
      duration: lesson.duration,
      lessonType: lesson.lessonType,
      videoURL: lesson.videoURL,
      content: lesson.content,
      orderIndex: lesson.orderIndex,
      resources: (lesson.resources || []).map(resource => ({
        resourceID: resource.resourceID.toString(),
        lessonID: lesson.lessonID.toString(),
        resourceType: resource.resourceType,
        resourceTitle: resource.resourceTitle,
        resourceURL: resource.resourceURL,
        uploadedAt: resource.uploadedAt,
      })),
    })),
  });

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
    formData: any
  ) => {
    if (!courseId || !course) return;

    setIsSaving(true);
    try {
      // Update course info
      const updatePayload = {
        title: formData.title || course.title,
        description: formData.description || course.description,
        duration: formData.duration || course.duration,
        price: formData.price || course.price,
        language: formData.language || course.language,
        thumbnailURL: formData.thumbnailURL || course.thumbnailURL,
        categoryID: formData.categoryID || 1,
      };

      console.log('=== UPDATE COURSE PAYLOAD ===', updatePayload);

      await updateCourse(parseInt(courseId), updatePayload);

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

  // ========== SECTION HANDLERS ==========
  const handleUpdateSection = async (sectionID: string, sectionData: SectionData) => {
    try {
      await updateSection(parseInt(sectionID), {
        title: sectionData.title,
        description: sectionData.description || '',
        orderIndex: sectionData.orderIndex,
      });
      toast({
        title: 'Success',
        description: 'Section updated',
      });
      return sectionData;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update section',
      });
      throw err;
    }
  };

  const handleDeleteSection = async (sectionID: string) => {
    try {
      await deleteSection(parseInt(sectionID));
      toast({
        title: 'Success',
        description: 'Section deleted',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete section',
      });
      throw err;
    }
  };

  // ========== LESSON HANDLERS ==========
  const handleUpdateLesson = async (lessonID: string, lessonData: any) => {
    try {
      await updateLesson(parseInt(lessonID), {
        title: lessonData.title,
        duration: lessonData.duration,
        lessonType: lessonData.lessonType,
        videoURL: lessonData.videoURL,
        content: lessonData.content,
        orderIndex: lessonData.orderIndex,
      });
      toast({
        title: 'Success',
        description: 'Lesson updated',
      });
      return lessonData;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update lesson',
      });
      throw err;
    }
  };

  const handleDeleteLesson = async (lessonID: string) => {
    try {
      await deleteLesson(parseInt(lessonID));
      toast({
        title: 'Success',
        description: 'Lesson deleted',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete lesson',
      });
      throw err;
    }
  };

  // ========== RESOURCE HANDLERS ==========
  const handleUpdateResource = async (resourceID: string, resourceData: any) => {
    try {
      await updateResource(parseInt(resourceID), {
        resourceType: resourceData.resourceType,
        resourceTitle: resourceData.resourceTitle,
        resourceURL: resourceData.resourceURL,
      });
      toast({
        title: 'Success',
        description: 'Resource updated',
      });
      return resourceData;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update resource',
      });
      throw err;
    }
  };

  const handleDeleteResource = async (resourceID: string) => {
    try {
      await deleteResource(parseInt(resourceID));
      toast({
        title: 'Success',
        description: 'Resource deleted',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to delete resource',
      });
      throw err;
    }
  };

  // ========== CREATE HANDLERS ==========
  const handleAddSection = async (sectionData: any) => {
    if (!courseId) return;
    try {
      const result = await createSection(parseInt(courseId), {
        title: sectionData.title,
        description: sectionData.description,
        orderIndex: sectionData.orderIndex,
      });
      console.log('=== API RESULT ===', { result, sectionID: result?.sectionID, id: result?.id });
      
      toast({
        title: 'Success',
        description: 'Section created',
      });
      
      // Return section data with new sectionID from API
      const sectionWithID = {
        ...sectionData,
        sectionID: result?.sectionID?.toString() || result?.id?.toString(),
      };
      console.log('=== RETURNING SECTION ===', { sectionWithID });
      return sectionWithID;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to create section',
      });
      throw err;
    }
  };

  const handleAddLesson = async (sectionId: string, lessonData: any) => {
    try {
      console.log('=== HANDLE ADD LESSON START ===', { 
        sectionID: sectionId, 
        lessonTitle: lessonData.title 
      });
      
      if (!sectionId) {
        throw new Error('Section ID is required');
      }

      const result = await createLesson(parseInt(sectionId), {
        title: lessonData.title,
        duration: lessonData.duration,
        lessonType: lessonData.lessonType,
        videoURL: lessonData.videoURL,
        content: lessonData.content,
        orderIndex: lessonData.orderIndex,
      });
      
      toast({
        title: 'Success',
        description: 'Lesson created',
      });
      // Return lesson data with new lessonID from API
      const lessonWithID = {
        ...lessonData,
        lessonID: result?.lessonID?.toString() || result?.id?.toString(),
      };
      console.log('=== RETURNING LESSON ===', { lessonWithID, resultData: result });
      return lessonWithID;
    } catch (err: any) {
      console.error('=== ERROR IN HANDLE ADD LESSON ===', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to create lesson',
      });
      throw err;
    }
  };

  const handleAddResource = async (lessonId: string, resourceData: any) => {
    try {
      console.log('=== HANDLE ADD RESOURCE START ===', { 
        lessonID: lessonId, 
        resourceTitle: resourceData.resourceTitle 
      });
      
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }

      const result = await createResource(parseInt(lessonId), {
        resourceType: resourceData.resourceType,
        resourceTitle: resourceData.resourceTitle,
        resourceURL: resourceData.resourceURL,
      });
      
      toast({
        title: 'Success',
        description: 'Resource created',
      });
      // Return resource data with new resourceID from API
      const resourceWithID = {
        ...resourceData,
        resourceID: result.resourceID?.toString() || result.id?.toString(),
      };
      console.log('=== RETURNING RESOURCE ===', { resourceWithID });
      return resourceWithID;
    } catch (err: any) {
      console.error('=== ERROR IN HANDLE ADD RESOURCE ===', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to create resource',
      });
      throw err;
    }
  };

  // ========== STEP 2: SAVE COURSE STRUCTURE ==========
  const handleStep2SaveStructure = async () => {
    if (!courseId || !course) return;

    setIsSaving(true);
    try {
      // In edit mode, we only save changes, not submit
      // The CourseStructureForm handles all CRUD operations internally
      // Just fetch updated data and show success message
      
      // Re-fetch the complete course data
      const updated = await getCourseDetail(parseInt(courseId));
      const normalizedCourse = normalizeCourseData(updated);
      setCourse(normalizedCourse);

      toast({
        title: 'Success',
        description: 'Course structure has been updated',
      });

      setShowSuccessModal(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save course structure';
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
          <StepIndicator
            currentStep={currentStep}
            steps={[
              { title: 'Course Information' },
              { title: 'Course Content' },
            ]}
          />
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
            {currentStep === 1 && course && (
              <CourseInfoForm
                data={{
                  title: course.title,
                  description: course.description,
                  categoryID: CATEGORIES.find(c => c.name === course.categoryName)?.id || 1,
                  language: course.language,
                  duration: course.duration,
                  price: course.price,
                  thumbnailURL: course.thumbnailURL,
                }}
                onNext={handleStep1Save}
                onBack={() => navigate('/tutor/courses')}
                categories={CATEGORIES as unknown as { id: number; name: string }[]}
                languages={LANGUAGES as unknown as { id: number; name: string }[]}
                isLoading={isSaving}
                showBackButton={true}
                submitButtonText="Next: Course Content"
              />
            )}

            {currentStep === 2 && (
              <CourseStructureForm
                sections={(course.section || []).map(convertToSectionData)}
                onSave={handleStep2SaveStructure}
                onBack={() => setCurrentStep(1)}
                mode="edit"
                isLoading={isSaving}
                onAddSection={handleAddSection}
                onUpdateSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
                onAddLesson={handleAddLesson}
                onUpdateLesson={handleUpdateLesson}
                onDeleteLesson={handleDeleteLesson}
                onAddResource={handleAddResource}
                onUpdateResource={handleUpdateResource}
                onDeleteResource={handleDeleteResource}
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseInfoForm, CourseStructureForm, StepIndicator, SectionData } from '@/pages/Shared/CourseForm';
import { courseApi, getCategories, getLanguages } from './course-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseId, setCourseId] = useState<string>('');
  const [courseData, setCourseData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');

  // Helper function to validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleStep1Next = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { courseId: newCourseId } = await courseApi.createCourse(data);
      setCourseId(newCourseId);
      setCourseData(data);
      setCourseTitle(data.title);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Save = async (sectionsData: SectionData[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate sections
      for (const section of sectionsData) {
        if (!section.title?.trim()) {
          throw new Error('Section title is required');
        }
        if (section.lessons.length === 0) {
          throw new Error(`Section "${section.title}" must have at least one lesson`);
        }
        for (const lesson of section.lessons) {
          if (!lesson.title?.trim()) {
            throw new Error('Lesson title is required');
          }
          if (lesson.resources?.length) {
            for (const resource of lesson.resources) {
              if (!resource.resourceTitle?.trim())
                throw new Error('Resource title is required');
              if (!resource.resourceURL?.trim())
                throw new Error('Resource URL is required');
              if (!isValidUrl(resource.resourceURL))
                throw new Error(
                  `Invalid resource URL: "${resource.resourceURL}". Must start with http:// or https://`
                );
            }
          }
        }
      }

      // Create sections, lessons, resources sequentially
      for (const section of sectionsData) {
        let sectionId: string = '';
        try {
          const result = await courseApi.addSection(courseId, {
            courseID: parseInt(courseId),
            title: section.title,
            description: section.description,
            orderIndex: section.orderIndex,
          });
          sectionId = result.sectionId;
        } catch (err) {
          throw new Error(`Failed to create section "${section.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        for (const lesson of section.lessons) {
          let lessonId: string = '';
          try {
            const result = await courseApi.addLesson(courseId, sectionId, {
              title: lesson.title,
              duration: lesson.duration,
              lessonType: lesson.lessonType || 'Video',
              videoURL: lesson.videoURL,
              content: lesson.content,
              orderIndex: lesson.orderIndex,
            });
            lessonId = result.lessonId;
          } catch (err) {
            throw new Error(`Failed to create lesson "${lesson.title}": ${err instanceof Error ? err.message : 'Unknown error'}`);
          }

          if (lesson.resources?.length) {
            for (const resource of lesson.resources) {
              try {
                await courseApi.addLessonResource(courseId, sectionId, lessonId, {
                  resourceType: resource.resourceType as 'PDF' | 'ExternalLink' | 'Video' | 'Document',
                  resourceTitle: resource.resourceTitle,
                  resourceURL: resource.resourceURL,
                });
              } catch (err) {
                throw new Error(`Failed to add resource "${resource.resourceTitle}": ${err instanceof Error ? err.message : 'Unknown error'}`);
              }
            }
          }
        }
      }

      toast({
        title: "Success!",
        description: "Course content saved! Submitting course...",
        duration: 2000,
      });

      const submitResult = await courseApi.submitCourse(courseId);

      if (
        submitResult.success &&
        (submitResult.status.toLowerCase() === 'pending' ||
          submitResult.status.toLowerCase() === 'draft')
      ) {
        setShowSuccessModal(true);
      } else {
        throw new Error(`Submit failed: Invalid status ${submitResult.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save course content';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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

          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-sm text-gray-600">
            Share your knowledge by creating an engaging course
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          steps={[
            { title: 'Course Info', description: 'Basic information' },
            { title: 'Course Content', description: 'Sections & lessons' },
          ]}
        />

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 ? 'Step 1: Basic Information' : 'Step 2: Course Structure'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <CourseInfoForm
                data={courseData}
                onNext={handleStep1Next}
                categories={getCategories()}
                languages={getLanguages()}
                isLoading={isSubmitting}
                submitButtonText="Next: Course Content"
              />
            )}

            {currentStep === 2 && (
              <CourseStructureForm
                sections={[]}
                onSave={handleStep2Save}
                onBack={() => setCurrentStep(1)}
                mode="create"
                isLoading={isSubmitting}
              />
            )}
          </CardContent>
        </Card>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md border-0 shadow-lg">
            <DialogHeader className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                🎉 Course Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Your course is now pending admin approval.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">📚 Course Title</p>
                <p className="font-semibold text-gray-900 text-lg">{courseTitle}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">⏳ Status</p>
                <p className="font-semibold text-blue-600">Pending</p>
              </div>
            </div>

            <DialogFooter className="flex gap-3 mt-6">
              <Button
                onClick={() => navigate('/courses')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1CourseInfo } from './components/step1-course-info';
import { Step2CourseContent } from './components/step2-course-content';
import { CourseFormData, SectionData, courseApi } from '@/queries/course-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState<Partial<CourseFormData>>({});
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Next = (data: CourseFormData) => {
    setCourseData(data);
    setCurrentStep(2);
  };

  const handleStep2Save = async (sectionsData: SectionData[]) => {
    setSections(sectionsData);
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await courseApi.createCourse(
        courseData as CourseFormData,
        sectionsData
      );

      navigate(`/tutor/courses`, {
        state: { message: 'Course created successfully!' },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create course'
      );
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm('Are you sure you want to cancel? All progress will be lost.')
    ) {
      navigate('/tutor/courses');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-sm text-gray-600">
            Share your knowledge by creating an engaging course
          </p>
        </div>

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
                <span className="mt-2 text-sm font-medium">Course Info</span>
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
                <span className="mt-2 text-sm font-medium">Course Content</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 ? 'Step 1: Basic Information' : 'Step 2: Course Structure'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <Step1CourseInfo
                data={courseData}
                onNext={handleStep1Next}
                onCancel={handleCancel}
              />
            )}

            {currentStep === 2 && (
              <Step2CourseContent
                sections={sections}
                onSave={handleStep2Save}
                onBack={() => setCurrentStep(1)}
              />
            )}
          </CardContent>
        </Card>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  Creating your course...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please wait while we set everything up
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

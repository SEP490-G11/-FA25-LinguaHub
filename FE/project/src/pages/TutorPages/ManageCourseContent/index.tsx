// Manage Course Content - Main Component (Unified Editor with Tabs)
// Route: /tutor/courses/:id/content

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, ArrowLeft, Info, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courseContentAPI } from '@/queries/course-content-api';
import { Step1CourseInfo } from '@/pages/CreateCourse/components/course-info';
import { Step2CourseContent } from '@/pages/CreateCourse/components/course-content';
import type { SectionData, CourseFormData } from '@/queries/course-api';

export default function ManageCourseContent() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');

  // Fetch course content (includes course info + sections/lessons)
  const {
    data: courseContent,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['course-content', courseId],
    queryFn: () => courseContentAPI.getCourseContent(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert backend format to CourseFormData for Step1
  const convertToCourseInfo = (): Partial<CourseFormData> => {
    if (!courseContent) return {};
    
    return {
      title: courseContent.Title || '',
      description: courseContent.Description || '',
      category_id: courseContent.CategoryID || '',
      languages: courseContent.Languages || [],
      duration_hours: courseContent.Duration || 0,
      price_vnd: courseContent.Price || 0,
      thumbnail: courseContent.ThumbnailURL || '',
    };
  };

  // Convert backend format to SectionData[] for Step2
  const convertToSections = (): SectionData[] => {
    if (!courseContent?.Sections) return [];
    
    return courseContent.Sections.map((section) => ({
      title: section.Title,
      description: section.Description || '',
      order_index: section.OrderIndex,
      lessons: (section.Lessons || []).map((lesson) => ({
        title: lesson.Title,
        duration_minutes: lesson.Duration,
        lesson_type: lesson.LessonType,
        video_url: lesson.VideoURL || '',
        content: lesson.Content || '',
        order_index: lesson.OrderIndex,
        resources: (lesson.Resources || []).map((resource) => ({
          resource_type: resource.ResourceType,
          resource_title: resource.ResourceTitle,
          resource_url: resource.ResourceURL,
        })),
      })),
    }));
  };

  // Mutation to save course info
  const saveInfoMutation = useMutation({
    mutationFn: async (courseInfo: CourseFormData) => {
      // Call API to update course basic information
      return await courseContentAPI.updateCourseInfo(courseId, {
        Title: courseInfo.title,
        Description: courseInfo.description,
        CategoryID: courseInfo.category_id,
        Languages: courseInfo.languages,
        Duration: courseInfo.duration_hours,
        Price: courseInfo.price_vnd,
        ThumbnailURL: courseInfo.thumbnail || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      alert('Course information updated successfully!');
      // Switch to content tab after saving info
      setActiveTab('content');
    },
    onError: (error) => {
      console.error('Failed to save course info:', error);
      alert('Failed to save course information. Please try again.');
    },
  });

  // Mutation to save course content (sections/lessons)
  const saveContentMutation = useMutation({
    mutationFn: async (sections: SectionData[]) => {
      // Convert frontend format to backend format
      const backendSections = sections.map((section, sectionIndex) => ({
        SectionID: section.id ? parseInt(section.id) : undefined,
        Title: section.title,
        Description: section.description || undefined,
        OrderIndex: sectionIndex,
        Lessons: section.lessons.map((lesson, lessonIndex) => ({
          LessonID: lesson.id ? parseInt(lesson.id) : undefined,
          Title: lesson.title,
          Duration: lesson.duration_minutes,
          LessonType: lesson.lesson_type || 'Video',
          VideoURL: lesson.video_url || undefined,
          Content: lesson.content || undefined,
          OrderIndex: lessonIndex,
          Resources: lesson.resources || [],
        })),
      }));

      // Call batch update API
      return await courseContentAPI.updateCourseContent(courseId, backendSections as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      alert('Course content updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to save content:', error);
      alert('Failed to save course content. Please try again.');
    },
  });

  const handleSaveCourseInfo = (courseInfo: CourseFormData) => {
    saveInfoMutation.mutate(courseInfo);
  };

  const handleSaveContent = (sections: SectionData[]) => {
    saveContentMutation.mutate(sections);
  };

  const handleBack = () => {
    navigate('/tutor/courses');
  };

  const handleCancel = () => {
    navigate('/tutor/courses');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load course: {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty State (no course found)
  if (!courseContent) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Course not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Success State - Tabbed Interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {courseContent.Title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit course information and manage content structure
          </p>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'info' | 'content')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Course Information
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Step1CourseInfo
                data={convertToCourseInfo()}
                onNext={handleSaveCourseInfo}
                onCancel={handleCancel}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Step2CourseContent
                sections={convertToSections()}
                onSave={handleSaveContent}
                submitButtonText="Save Changes"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

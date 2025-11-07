// Manage Course Content - Main Component (Unified Editor with Tabs)
// Route: /tutor/courses/:id/content

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, ArrowLeft, Info, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { courseContentAPI } from '@/features/tutor/queries/course-content-api';
import { Step1CourseInfo } from '@/features/learner/pages/CreateCourse/components/course-info';
import { Step2CourseContent } from '@/features/learner/pages/CreateCourse/components/course-content';
import type { SectionData, CourseFormData } from '@/features/learner/queries/course-api';

export default function ManageCourseContent() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');

  // Debug logging
  console.log('[ManageCourseContent] Rendering with courseId:', courseId);

  // Fetch course content (includes course info + sections/lessons)
  const {
    data: courseContent,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['course-content', courseId],
    queryFn: () => {
      console.log('[ManageCourseContent] Fetching course content for courseId:', courseId);
      return courseContentAPI.getCourseContent(courseId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug: Log when data changes
  console.log('[ManageCourseContent] Query state - Loading:', isLoading, 'Error:', isError, 'Data:', courseContent);

  // Convert backend format to CourseFormData for Step1
  const convertToCourseInfo = (): Partial<CourseFormData> => {
    if (!courseContent) {
      console.log('[ManageCourseContent] No courseContent available for conversion');
      return {};
    }
    
    console.log('[ManageCourseContent] Converting courseContent to CourseFormData:', courseContent);
    
    const converted = {
      title: courseContent.Title || '',
      description: courseContent.Description || '',
      categoryID: parseInt(courseContent.CategoryID as any) || 0,
      language: courseContent.Languages?.[0] || 'English',
      duration: courseContent.Duration || 0,
      price: courseContent.Price || 0,
      thumbnailURL: courseContent.ThumbnailURL || '',
    };
    
    console.log('[ManageCourseContent] Converted course info:', converted);
    return converted;
  };

  // Convert backend format to SectionData[] for Step2
  const convertToSections = (): SectionData[] => {
    console.log('[ManageCourseContent] convertToSections called');
    console.log('[ManageCourseContent] courseContent:', courseContent);
    console.log('[ManageCourseContent] courseContent?.Sections:', courseContent?.Sections);
    
    if (!courseContent?.Sections) {
      console.log('[ManageCourseContent] No sections available');
      return [];
    }
    
    console.log('[ManageCourseContent] courseContent.Sections.length:', courseContent.Sections.length);
    console.log('[ManageCourseContent] Converting sections:', courseContent.Sections);
    
    const converted = courseContent.Sections.map((section, idx) => {
      console.log(`[ManageCourseContent] Converting section[${idx}]:`, section);
      
      const mappedSection = {
        id: section.SectionID?.toString(),
        title: section.Title,
        description: section.Description || '',
        orderIndex: section.OrderIndex,
        lessons: (section.Lessons || []).map((lesson, lessonIdx) => {
          console.log(`[ManageCourseContent] Converting lesson[${idx}][${lessonIdx}]:`, lesson);
          
          return {
            id: lesson.LessonID?.toString(),
            title: lesson.Title,
            duration: lesson.Duration,
            lessonType: (lesson.LessonType as 'Video' | 'Reading') || 'Video',
            videoURL: lesson.VideoURL || '',
            content: lesson.Content || '',
            orderIndex: lesson.OrderIndex,
            resources: (lesson.Resources || []).map((resource, resIdx) => {
              console.log(`[ManageCourseContent] Converting resource[${idx}][${lessonIdx}][${resIdx}]:`, resource);
              
              return {
                id: resource.ResourceID?.toString(),
                resourceType: (resource.ResourceType as 'PDF' | 'ExternalLink'),
                resourceTitle: resource.ResourceTitle,
                resourceURL: resource.ResourceURL,
              };
            }),
          };
        }),
      };
      
      console.log(`[ManageCourseContent] Mapped section[${idx}]:`, mappedSection);
      return mappedSection;
    });
    
    console.log('[ManageCourseContent] All converted sections:', converted);
    return converted;
  };

  // Mutation to save course info
  const saveInfoMutation = useMutation({
    mutationFn: async (courseInfo: CourseFormData) => {
      // Call API to update course basic information
      console.log('[ManageCourseContent] Saving course info:', courseInfo);
      return await courseContentAPI.updateCourseInfo(courseId, {
        Title: courseInfo.title,
        Description: courseInfo.description,
        CategoryID: courseInfo.categoryID,
        Languages: [courseInfo.language],
        Duration: courseInfo.duration,
        Price: courseInfo.price,
        ThumbnailURL: courseInfo.thumbnailURL || undefined,
      });
    },
    onSuccess: () => {
      console.log('[ManageCourseContent] Course info saved successfully');
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      alert('Course information updated successfully!');
      // Switch to content tab after saving info
      setActiveTab('content');
    },
    onError: (error) => {
      console.error('[ManageCourseContent] Failed to save course info:', error);
      alert('Failed to save course information. Please try again.');
    },
  });

  // Mutation to save course content (sections/lessons)
  const saveContentMutation = useMutation({
    mutationFn: async (sections: SectionData[]) => {
      // For now, iterate through sections and update them individually
      // TODO: Add batch update endpoint to backend if needed
      console.log('[ManageCourseContent] Saving sections:', sections);
      
      for (const section of sections) {
        if (section.id) {
          // Update existing section
          await courseContentAPI.updateSection(parseInt(section.id), {
            Title: section.title,
            Description: section.description || undefined,
          });
        }
        
        // Update lessons in section
        for (const lesson of section.lessons || []) {
          if (lesson.id) {
            // Update existing lesson
            await courseContentAPI.updateLesson(parseInt(lesson.id), {
              Title: lesson.title,
              Duration: lesson.duration,
              LessonType: (lesson.lessonType as 'Video' | 'Reading'),
              VideoURL: lesson.videoURL || undefined,
              Content: lesson.content || undefined,
            });
          }
        }
      }
      
      return true;
    },
    onSuccess: () => {
      console.log('[ManageCourseContent] Sections saved successfully');
      queryClient.invalidateQueries({ queryKey: ['course-content', courseId] });
      alert('Course content updated successfully!');
    },
    onError: (error) => {
      console.error('[ManageCourseContent] Failed to save content:', error);
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

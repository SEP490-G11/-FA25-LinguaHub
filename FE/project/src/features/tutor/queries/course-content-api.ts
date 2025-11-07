// API Wrapper for Course Content Management
import { BaseRequest } from '@/configs/api';
import {
  CourseContentData,
  SectionData,
  LessonData,
  AddSectionFormData,
  AddLessonFormData,
} from '../pages/TutorPages/ManageCourseContent/types';

// Real API functions using BaseRequest wrapper
export const courseContentAPI = {
  // Get full course content with all sections and lessons
  // Since backend doesn't have GET /tutor/courses/{id}, we need to:
  // 1. Get course info from GET /tutor/courses/me
  // 2. Get sections from GET /tutor/courses/sections/{courseId}
  getCourseContent: async (courseId: number): Promise<CourseContentData> => {
    try {
      console.log('[courseContentAPI] Fetching course content for courseId:', courseId);
      
      // Get all courses and find the one we need
      const coursesRes = await BaseRequest.Get<any>('/tutor/courses/me');
      const courses = coursesRes?.result || coursesRes || [];
      const course = Array.isArray(courses) ? courses.find((c: any) => c.id === courseId || c.courseID === courseId) : courses;
      
      if (!course) {
        console.error('[courseContentAPI] Course not found with id:', courseId);
        throw new Error(`Course with id ${courseId} not found`);
      }
      
      console.log('[courseContentAPI] Found course:', course);
      
      // Get sections for this course
      console.log('[courseContentAPI] Calling GET /tutor/courses/sections/' + courseId);
      const sectionsRes = await BaseRequest.Get<any>(`/tutor/courses/sections/${courseId}`);
      console.log('[courseContentAPI] Sections response:', sectionsRes);
      const sections = sectionsRes?.result || sectionsRes || [];
      console.log('[courseContentAPI] Parsed sections array:', sections);
      console.log('[courseContentAPI] Sections length:', Array.isArray(sections) ? sections.length : 'not array');
      console.log('[courseContentAPI] Fetched sections:', sections);
      
      // Combine course info with sections
      const courseContent: CourseContentData = {
        CourseID: course.id || course.courseID,
        Title: course.title || '',
        Description: course.description || '',
        CategoryID: course.categoryID || '',
        Languages: course.languages ? (Array.isArray(course.languages) ? course.languages : [course.languages]) : [],
        Duration: course.duration || 0,
        Price: course.price || 0,
        ThumbnailURL: course.thumbnailURL || course.thumbnailUrl || '',
        Status: course.status || 'Draft',
        Sections: sections || [],
      };
      
      console.log('[courseContentAPI] Combined course content:', courseContent);
      return courseContent;
    } catch (error) {
      console.error('[courseContentAPI] Error fetching course content:', error);
      throw error;
    }
  },

  // Update course basic info
  updateCourseInfo: async (
    courseId: number,
    data: {
      Title?: string;
      Description?: string;
      CategoryID?: number;
      Languages?: string[];
      Duration?: number;
      Price?: number;
      ThumbnailURL?: string;
    }
  ): Promise<CourseContentData> => {
    const payload: Record<string, unknown> = {};
    
    // Map PascalCase (frontend) to camelCase (backend)
    if (data.Title) payload.title = data.Title;
    if (data.Description) payload.description = data.Description;
    if (data.CategoryID) payload.categoryID = data.CategoryID;
    if (data.Languages?.[0]) payload.language = data.Languages[0]; // Backend expects single language string
    if (data.Duration !== undefined) payload.duration = data.Duration;
    if (data.Price !== undefined) payload.price = data.Price;
    if (data.ThumbnailURL) payload.thumbnailURL = data.ThumbnailURL;

    const res = await BaseRequest.Put<any>(`/tutor/courses/${courseId}`, payload);
    return res?.result || res;
  },

  // Add a new section to a course
  addSection: async (
    courseId: number,
    data: AddSectionFormData
  ): Promise<SectionData> => {
    const payload: Record<string, unknown> = {
      courseID: courseId,
      title: data.Title,
      orderIndex: 0, // Default order, will be set properly
    };
    
    if (data.Description) {
      payload.description = data.Description;
    }

    const res = await BaseRequest.Post<any>('/tutor/courses/sections', payload);
    return res?.result || res;
  },

  // Update an existing section
  updateSection: async (
    sectionId: number,
    data: Partial<AddSectionFormData>
  ): Promise<SectionData> => {
    const payload: Record<string, unknown> = {};
    
    // Map PascalCase to camelCase
    if (data.Title) payload.title = data.Title;
    if (data.Description !== undefined) payload.description = data.Description;

    const res = await BaseRequest.Put<any>(`/tutor/courses/sections/${sectionId}`, payload);
    return res?.result || res;
  },

  // Delete a section
  deleteSection: async (sectionId: number): Promise<void> => {
    await BaseRequest.Delete(`/tutor/courses/sections/${sectionId}`);
  },

  // Reorder sections (if backend supports)
  reorderSections: async (courseId: number, sectionIds: number[]): Promise<void> => {
    await BaseRequest.Put(`/tutor/courses/${courseId}/sections/reorder`, { sectionIds });
  },

  // Add a new lesson to a section
  addLesson: async (
    sectionId: number,
    data: AddLessonFormData
  ): Promise<LessonData> => {
    const payload: Record<string, unknown> = {
      title: data.Title,
      duration: data.Duration,
      lessonType: data.LessonType,
      orderIndex: 0, // Default order
    };
    
    if (data.VideoURL) payload.videoURL = data.VideoURL;
    if (data.Content) payload.content = data.Content;

    const res = await BaseRequest.Post<any>(`/tutor/courses/sections/${sectionId}/lessons`, payload);
    return res?.result || res;
  },

  // Update an existing lesson
  updateLesson: async (
    lessonId: number,
    data: Partial<AddLessonFormData>
  ): Promise<LessonData> => {
    const payload: Record<string, unknown> = {};
    
    // Map PascalCase to camelCase
    if (data.Title) payload.title = data.Title;
    if (data.Duration !== undefined) payload.duration = data.Duration;
    if (data.LessonType) payload.lessonType = data.LessonType;
    if (data.VideoURL !== undefined) payload.videoURL = data.VideoURL;
    if (data.Content !== undefined) payload.content = data.Content;

    const res = await BaseRequest.Put<any>(`/tutor/courses/sections/lessons/${lessonId}`, payload);
    return res?.result || res;
  },

  // Delete a lesson
  deleteLesson: async (lessonId: number): Promise<void> => {
    await BaseRequest.Delete(`/tutor/courses/sections/lessons/${lessonId}`);
  },

  // Reorder lessons within a section (if backend supports)
  reorderLessons: async (sectionId: number, lessonIds: number[]): Promise<void> => {
    await BaseRequest.Put(`/tutor/courses/sections/${sectionId}/lessons/reorder`, { lessonIds });
  },

  // Add a resource to a lesson
  addResource: async (
    lessonId: number,
    data: {
      ResourceType: 'PDF' | 'ExternalLink';
      ResourceTitle: string;
      ResourceURL: string;
    }
  ): Promise<any> => {
    const payload: Record<string, unknown> = {
      resourceType: data.ResourceType,
      resourceURL: data.ResourceURL,
    };
    
    if (data.ResourceTitle?.trim()) {
      payload.resourceTitle = data.ResourceTitle.trim();
    }

    const res = await BaseRequest.Post<any>(`/tutor/lessons/${lessonId}/resources`, payload);
    return res?.result || res;
  },

  // Update a resource
  updateResource: async (
    resourceId: number,
    data: {
      ResourceType?: 'PDF' | 'ExternalLink';
      ResourceTitle?: string;
      ResourceURL?: string;
    }
  ): Promise<any> => {
    const payload: Record<string, unknown> = {};
    
    // Map PascalCase to camelCase
    if (data.ResourceType) payload.resourceType = data.ResourceType;
    if (data.ResourceTitle) payload.resourceTitle = data.ResourceTitle;
    if (data.ResourceURL) payload.resourceURL = data.ResourceURL;

    const res = await BaseRequest.Put<any>(`/tutor/resources/${resourceId}`, payload);
    return res?.result || res;
  },

  // Delete a resource
  deleteResource: async (resourceId: number): Promise<void> => {
    await BaseRequest.Delete(`/tutor/resources/${resourceId}`);
  },
};

export default courseContentAPI;

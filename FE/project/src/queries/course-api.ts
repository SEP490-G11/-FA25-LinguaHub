import { BaseRequest } from '@/lib/api';
import { CATEGORIES, LANGUAGES, type Category, type Language } from '@/constants/categories';

export type { Category, Language };

export interface CourseFormData {
  title: string;
  description: string;
  categoryID: number;  // Changed from category_id (string) to categoryID (number)
  language: string;
  duration: number;    // Changed from duration_hours
  price: number;       // Changed from price_vnd
  thumbnailURL?: string;  // Changed from thumbnail, now required by backend
}

export interface SectionFormData {
  courseID: number;  // Required by backend
  title: string;
  description?: string | null;
  orderIndex: number;  // Changed from order_index to orderIndex
}

export interface LessonFormData {
  title: string;
  duration: number;    // Changed from duration_minutes to duration
  lessonType: 'Video' | 'Reading';  // Changed from lesson_type to lessonType
  videoURL?: string;   // Changed from video_url to videoURL
  content?: string;
  orderIndex: number;  // Changed from order_index to orderIndex
}

export interface ResourceFormData {
  resourceType: 'PDF' | 'ExternalLink';  // Changed from resource_type to resourceType
  resourceTitle: string;  // Changed from resource_title to resourceTitle
  resourceURL: string;    // Changed from resource_url to resourceURL
}

export interface SectionData {
  id?: string;
  title: string;
  description?: string | null;
  orderIndex: number;  // Changed from order_index
  lessons: LessonData[];
}

export interface LessonResourceData {
  id?: string;
  resourceType: 'PDF' | 'ExternalLink';  // Changed from resource_type
  resourceTitle: string;  // Changed from resource_title
  resourceURL: string;    // Changed from resource_url
}

export interface LessonData {
  id?: string;
  title: string;
  duration: number;      // Changed from duration_minutes
  lessonType?: 'Video' | 'Reading';  // Changed from lesson_type
  videoURL?: string;     // Changed from video_url
  content?: string;
  orderIndex: number;    // Changed from order_index
  resources?: LessonResourceData[];
}

interface ApiResponse<T> {
  result?: T;
  id?: string | number;
  courseID?: number;
  sectionID?: number;
  lessonID?: number;
  resourceID?: number;
  url?: string;
  publicUrl?: string;
}

export const courseApi = {
  createCourse: async (courseData: CourseFormData): Promise<{ courseId: string }> => {
    // Map frontend data to backend expected format
    const payload = {
      title: courseData.title,
      description: courseData.description,
      categoryID: courseData.categoryID,
      language: courseData.language,
      duration: courseData.duration,
      price: courseData.price,
      thumbnailURL: courseData.thumbnailURL || '', // Backend requires this field
    };
    const res = await BaseRequest.Post<ApiResponse<{ courseID?: number; id?: string | number }>>('/tutor/courses', payload);
    const courseId = res?.result?.courseID || res?.result?.id || res?.courseID || res?.id;
    if (!courseId) throw new Error('Invalid response from server');
    return { courseId: courseId.toString() };
  },

  addSection: async (courseId: string, sectionData: SectionFormData): Promise<{ sectionId: string }> => {
    // Backend: POST /tutor/courses/sections with courseID in body
    const payload: Record<string, unknown> = {
      courseID: parseInt(courseId),
      title: sectionData.title,
      orderIndex: sectionData.orderIndex,
    };
    
    // Only add description if it has value
    if (sectionData.description) {
      payload.description = sectionData.description;
    }
    
    const res = await BaseRequest.Post<ApiResponse<{ id: string; sectionID?: number }>>('/tutor/courses/sections', payload);
    const sectionId = res?.result?.sectionID || res?.result?.id || res?.id;
    if (!sectionId) throw new Error('Invalid response');
    return { sectionId: sectionId.toString() };
  },

  addLesson: async (_courseId: string, sectionId: string, lessonData: LessonFormData): Promise<{ lessonId: string }> => {
    // Backend: POST /tutor/courses/sections/{sectionID}/lessons
    const payload: Record<string, unknown> = {
      title: lessonData.title,
      duration: lessonData.duration,
      lessonType: lessonData.lessonType,
      orderIndex: lessonData.orderIndex,
    };
    
    // Only add optional fields if they have values
    if (lessonData.videoURL) {
      payload.videoURL = lessonData.videoURL;
    }
    if (lessonData.content) {
      payload.content = lessonData.content;
    }
    
    const res = await BaseRequest.Post<ApiResponse<{ id: string; lessonID?: number }>>(`/tutor/courses/sections/${sectionId}/lessons`, payload);
    const lessonId = res?.result?.lessonID || res?.result?.id || res?.id;
    if (!lessonId) throw new Error('Invalid response');
    return { lessonId: lessonId.toString() };
  },

  addLessonResource: async (_courseId: string, _sectionId: string, lessonId: string, resourceData: ResourceFormData): Promise<{ resourceId: string }> => {
    // Backend: POST /tutor/lessons/{lessonId}/resources
    const payload: Record<string, unknown> = {
      resourceType: resourceData.resourceType,
      resourceURL: resourceData.resourceURL,
    };
    
    // Only add resourceTitle if it has a non-empty value
    if (resourceData.resourceTitle && resourceData.resourceTitle.trim() !== '') {
      payload.resourceTitle = resourceData.resourceTitle.trim();
    }
    
    const res = await BaseRequest.Post<ApiResponse<{ id: string; resourceID?: number }>>(`/tutor/lessons/${lessonId}/resources`, payload);
    const resourceId = res?.result?.resourceID || res?.result?.id || res?.id;
    if (!resourceId) throw new Error('Invalid response');
    return { resourceId: resourceId.toString() };
  },

  uploadThumbnail: async (file: File, courseId: string): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const res = await BaseRequest.Post<ApiResponse<{ url: string }>>(`/tutor/courses/${courseId}/thumbnail`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res?.result?.url || res?.url || res?.publicUrl || '';
  },
};

// Helper functions to get hardcoded categories and languages
export const getCategories = (): Category[] => [...CATEGORIES];
export const getLanguages = (): Language[] => [...LANGUAGES];

export default courseApi;

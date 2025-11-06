import api from '@/config/axiosConfig';

export interface Category {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  code?: string; // e.g., 'en', 'vi', 'zh'
}

export interface CourseFormData {
  title: string;
  description: string;
  category_id: string;
  languages: string[];
  duration_hours: number;
  price_vnd: number;
  thumbnail?: string | null;
  status?: 'pending' | 'draft' | 'published';
}

export interface SectionData {
  id?: string;
  title: string;
  description?: string | null;
  order_index: number;
  lessons: LessonData[];
}

export interface LessonResourceData {
  resource_type: 'PDF' | 'ExternalLink';
  resource_title: string;
  resource_url: string;
}

export interface LessonData {
  id?: string;
  title: string;
  duration_minutes: number;
  lesson_type?: 'Video' | 'Reading';
  video_url?: string;
  content?: string;
  order_index: number;
  resources?: LessonResourceData[];
}

/**
 * NOTE: The original implementation used Supabase storage and row-level operations.
 * I mapped those behaviours to reasonable REST endpoints. Assumptions made:
 * - POST /courses                -> creates a course and returns the created course object
 * - POST /courses/:id/thumbnail  -> accepts multipart/form-data with 'file' and returns { url }
 * - GET  /categories             -> returns an array of { id, name }
 * - The server will accept sections and lessons nested inside the create course payload.
 * If your backend uses different routes, adjust the URLs below accordingly.
 */
export const courseApi = {
  uploadThumbnail: async (file: File, courseId: string): Promise<string> => {
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post(`/courses/${courseId}/thumbnail`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Expect { url: string } or { publicUrl }
      return (res && (res as any).url) || (res && (res as any).publicUrl) || '';
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Upload failed';
      throw new Error(`Failed to upload thumbnail: ${message}`);
    }
  },

  createCourse: async (
    courseData: CourseFormData,
    sections: SectionData[]
  ): Promise<{ courseId: string }> => {
    try {
      const payload = {
        ...courseData,
        sections,
        status: 'pending', // Set status to pending
        created_at: new Date().toISOString(),
      };

      const res = await api.post('/courses', payload);

      // Expect created course object in response
      const created = (res && (res as any)) || {};
      const courseId = created.id || created.courseId || created.course?.id;

      if (!courseId) {
        throw new Error('Invalid response from server when creating course');
      }

      return { courseId };
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to create course';
      throw new Error(message);
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await api.get('/categories');
      return (res && (res as any)) || [];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch categories';
      throw new Error(message);
    }
  },

  getLanguages: async (): Promise<Language[]> => {
    try {
      const res = await api.get('/languages');
      return (res && (res as any)) || [];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch languages';
      throw new Error(message);
    }
  },
};

export default courseApi;

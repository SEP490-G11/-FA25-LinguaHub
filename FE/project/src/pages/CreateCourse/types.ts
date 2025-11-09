// TypeScript types cho CreateCourse page
// Không import từ bên ngoài, tự định nghĩa

export interface CourseFormData {
  title: string;
  description: string;
  categoryID: number;      // ID từ CATEGORIES (e.g., 1, 2, 3) - MUST BE NUMBER
  language: string;        // Name từ LANGUAGES (e.g., "English", "Vietnamese")
  duration: number;        // hours
  price: number;           // VND
  thumbnailURL?: string;
}

export interface LessonResource {
  resource_type: 'PDF' | 'ExternalLink';
  resource_title: string;
  resource_url: string;
}

export interface LessonData {
  id?: string;
  title: string;
  duration_minutes: number;
  lesson_type: 'Video' | 'Reading';
  video_url?: string;
  content?: string;
  order_index: number;
  resources?: LessonResource[];
}

export interface SectionData {
  id?: string;
  title: string;
  description?: string;
  order_index: number;
  lessons: LessonData[];
}

export interface CreateCoursePayload {
  courseInfo: CourseFormData;
  sections: SectionData[];
}

export interface CreateCourseResponse {
  success: boolean;
  courseId: string;
  message?: string;
}

// Form validation với Zod + React Hook Form
// Định nghĩa schema và hook để sử dụng trong UI

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CourseFormData, SectionData, LessonData } from './types';

// ============ STEP 1: Course Info Schema ============
export const courseInfoSchema = z.object({
  title: z.string()
    .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
    .max(100, 'Tiêu đề không được quá 100 ký tự'),
  
  description: z.string()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(1000, 'Mô tả không được quá 1000 ký tự'),
  
  categoryID: z.number({
    required_error: 'Vui lòng chọn danh mục',
    invalid_type_error: 'Danh mục phải là số',
  }).int().positive(),
  
  language: z.string()
    .nonempty('Vui lòng chọn ngôn ngữ'),
  
  duration: z.number()
    .min(1, 'Thời lượng phải ít nhất 1 giờ')
    .max(999, 'Thời lượng không được quá 999 giờ'),
  
  price: z.number()
    .min(0, 'Giá không được âm')
    .max(999999999, 'Giá quá lớn'),
  
  thumbnailURL: z.string()
    .url('URL không hợp lệ')
    .optional()
    .or(z.literal('')),
});

export type CourseInfoFormValues = z.infer<typeof courseInfoSchema>;

/**
 * Hook để sử dụng form cho Step 1
 */
export function useCourseInfoForm(defaultValues?: Partial<CourseFormData>) {
  return useForm<CourseInfoFormValues>({
    resolver: zodResolver(courseInfoSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      categoryID: defaultValues?.categoryID,
      language: defaultValues?.language || '',
      duration: defaultValues?.duration,
      price: defaultValues?.price || 0,
      thumbnailURL: defaultValues?.thumbnailURL || '',
    },
  });
}

// ============ STEP 2: Lesson Schema (cho modal) ============
export const lessonSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài học là bắt buộc'),
  duration_minutes: z.number().min(1, 'Thời lượng phải ít nhất 1 phút'),
  lesson_type: z.enum(['Video', 'Reading']),
  video_url: z.string().url().optional().or(z.literal('')),
  content: z.string().optional(),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

/**
 * Hook để sử dụng form cho Lesson
 */
export function useLessonForm(defaultValues?: Partial<LessonData>) {
  return useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      duration_minutes: defaultValues?.duration_minutes || undefined,
      lesson_type: defaultValues?.lesson_type || 'Video',
      video_url: defaultValues?.video_url || '',
      content: defaultValues?.content || '',
    },
  });
}

// ============ Validation helpers ============

/**
 * Validate toàn bộ course content trước khi submit
 */
export function validateCourseContent(sections: SectionData[]): { valid: boolean; error?: string } {
  if (sections.length === 0) {
    return { valid: false, error: 'Vui lòng thêm ít nhất 1 section' };
  }

  for (const section of sections) {
    if (!section.title.trim()) {
      return { valid: false, error: 'Tên section không được để trống' };
    }
    
    if (section.lessons.length === 0) {
      return { valid: false, error: `Section "${section.title}" phải có ít nhất 1 bài học` };
    }

    for (const lesson of section.lessons) {
      if (!lesson.title.trim()) {
        return { valid: false, error: 'Tên bài học không được để trống' };
      }
      
      if (lesson.lesson_type === 'Video' && !lesson.video_url) {
        return { valid: false, error: `Bài học "${lesson.title}" cần có URL video` };
      }
      
      if (lesson.lesson_type === 'Reading' && !lesson.content) {
        return { valid: false, error: `Bài học "${lesson.title}" cần có nội dung` };
      }
    }
  }

  return { valid: true };
}

// API calls cho CreateCourse page
// Chỉ dùng axios, không import React Query hay types từ ngoài

import axios from '@/config/axiosConfig';
import type { CourseFormData, SectionData, LessonData, LessonResource, CreateCourseResponse } from './types';

/**
 * Step 1: Tạo course với thông tin cơ bản
 * POST /tutor/courses
 */
export async function createCourseApi(data: CourseFormData): Promise<CreateCourseResponse> {
  try {
    // 🔍 Debug: Check token
    const token = localStorage.getItem('access_token');
    console.log('🔐 Token exists:', !!token);
    console.log('🔐 Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    console.log('📤 API Request: POST /tutor/courses');
    console.log('Request Body:', {
      title: data.title,
      description: data.description,
      categoryID: data.categoryID,
      language: data.language,
      duration: data.duration,
      price: data.price,
      thumbnailURL: data.thumbnailURL,
    });

    const response = await axios.post('/tutor/courses', {
      title: data.title,
      description: data.description,
      categoryID: data.categoryID,
      language: data.language,
      duration: data.duration,
      price: data.price,
      thumbnailURL: data.thumbnailURL,
    });
    
    console.log('📥 API Response:', response.data);
    
    // Backend trả về courseId
    const courseId = response.data.courseId || response.data.id || response.data;
    
    return {
      success: true,
      courseId: String(courseId),
      message: 'Course created successfully',
    };
  } catch (error: any) {
    console.error('❌ API Error:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Headers:', error.response?.headers);
    throw new Error(error.response?.data?.message || 'Failed to create course');
  }
}

/**
 * Step 2a: Tạo section cho course
 * POST /tutor/courses/sections/{courseId}
 */
export async function createSectionApi(
  courseId: string,
  section: SectionData
): Promise<{ sectionId: string }> {
  try {
    const response = await axios.post(`/tutor/courses/sections/${courseId}`, {
      title: section.title,
      description: section.description,
      orderIndex: section.order_index,
    });
    
    const sectionId = response.data.sectionId || response.data.id || response.data;
    
    return { sectionId: String(sectionId) };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create section');
  }
}

/**
 * Step 2b: Tạo lesson cho section
 * POST /tutor/courses/sections/{sectionId}/lessons
 */
export async function createLessonApi(
  sectionId: string,
  lesson: LessonData
): Promise<{ lessonId: string }> {
  try {
    const response = await axios.post(`/tutor/courses/sections/${sectionId}/lessons`, {
      title: lesson.title,
      duration: lesson.duration_minutes,
      lessonType: lesson.lesson_type,
      videoURL: lesson.video_url,
      content: lesson.content,
      orderIndex: lesson.order_index,
    });
    
    const lessonId = response.data.lessonId || response.data.id || response.data;
    
    return { lessonId: String(lessonId) };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create lesson');
  }
}

/**
 * Step 2c: Tạo resource cho lesson
 * POST /tutor/lessons/{lessonId}/resources
 */
export async function createResourceApi(
  lessonId: string,
  resource: LessonResource
): Promise<void> {
  try {
    await axios.post(`/tutor/lessons/${lessonId}/resources`, {
      resourceType: resource.resource_type,
      resourceTitle: resource.resource_title,
      resourceURL: resource.resource_url,
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create resource');
  }
}

/**
 * Step 2: Lưu toàn bộ nội dung khóa học
 * Gọi tuần tự: sections → lessons → resources
 */
export async function saveCourseContentApi(
  courseId: string,
  sections: SectionData[]
): Promise<CreateCourseResponse> {
  try {
    console.group('📤 API: Save Course Content');
    console.log('Course ID:', courseId);
    console.log('Total Sections:', sections.length);

    // Loop qua từng section
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const section = sections[sIdx];
      console.log(`\n📁 Section ${sIdx + 1}/${sections.length}: ${section.title}`);
      
      // 1. Tạo section
      const { sectionId } = await createSectionApi(courseId, section);
      console.log(`  ✓ Section created with ID: ${sectionId}`);
      
      // 2. Loop qua từng lesson trong section
      for (let lIdx = 0; lIdx < section.lessons.length; lIdx++) {
        const lesson = section.lessons[lIdx];
        console.log(`  📄 Lesson ${lIdx + 1}/${section.lessons.length}: ${lesson.title}`);
        
        // Tạo lesson
        const { lessonId } = await createLessonApi(sectionId, lesson);
        console.log(`    ✓ Lesson created with ID: ${lessonId}`);
        
        // 3. Loop qua từng resource trong lesson (nếu có)
        if (lesson.resources && lesson.resources.length > 0) {
          console.log(`    📎 Creating ${lesson.resources.length} resources...`);
          for (const resource of lesson.resources) {
            await createResourceApi(lessonId, resource);
            console.log(`      ✓ Resource: ${resource.resource_title}`);
          }
        }
      }
    }
    
    console.log('\n✅ All content saved successfully!');
    console.groupEnd();
    
    return {
      success: true,
      courseId: courseId,
      message: 'Course content saved successfully',
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to save course content');
  }
}

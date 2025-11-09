// Test data để kiểm tra API payload
// Sử dụng file này để verify format trước khi gửi lên backend

import type { CourseFormData, SectionData, LessonData } from './types';

/**
 * STEP 1: Create Course
 * POST /tutor/courses
 */
export const EXAMPLE_COURSE_PAYLOAD: CourseFormData = {
  title: "IELTS Writing Foundation BY Tutor huy nam",
  description: "Learn how to write IELTS Task 1 and Task 2 essays effectively.",
  duration: 30,
  price: 2500000,
  language: "English",           // String từ LANGUAGES.name
  thumbnailURL: "https://example.com/ielts-writing.jpg",
  categoryID: 2,                  // Number từ CATEGORIES.id
};

/**
 * STEP 2a: Create Section
 * POST /tutor/courses/sections/{courseId}
 * 
 * Example: POST /tutor/courses/sections/3
 */
export const EXAMPLE_SECTION_PAYLOAD = {
  title: "Part 1 - Writing Introduction",
  description: "Learn how to write strong introductions for IELTS essays.",
  orderIndex: 2,
};

/**
 * STEP 2b: Create Lesson
 * POST /tutor/courses/sections/{sectionId}/lessons
 * 
 * Example: POST /tutor/courses/sections/6/lessons
 */
export const EXAMPLE_LESSON_PAYLOAD = {
  title: "Lesson 1 - How to Paraphrase",
  duration: 15,                   // duration_minutes
  lessonType: "Video",            // "Video" | "Reading"
  videoURL: "https://example.com/paraphrase.mp4",
  content: "This lesson teaches how to paraphrase IELTS writing prompts.",
  orderIndex: 3,
};

/**
 * STEP 2c: Create Resource
 * POST /tutor/lessons/{lessonId}/resources
 * 
 * Example: POST /tutor/lessons/1/resources
 */
export const EXAMPLE_RESOURCE_PAYLOAD = {
  resourceType: "ExternalLink",   // "PDF" | "ExternalLink"
  resourceTitle: "Paraphrasing Guide",
  resourceURL: "https://example.com/paraphrase-guide.pdf",
};

/**
 * Complete Flow Example
 */
export const COMPLETE_COURSE_EXAMPLE: SectionData[] = [
  {
    title: "Part 1 - Writing Introduction",
    description: "Learn how to write strong introductions for IELTS essays.",
    order_index: 0,
    lessons: [
      {
        title: "Lesson 1 - How to Paraphrase",
        duration_minutes: 15,
        lesson_type: "Video",
        video_url: "https://example.com/paraphrase.mp4",
        content: "This lesson teaches how to paraphrase IELTS writing prompts.",
        order_index: 0,
        resources: [
          {
            resource_type: "ExternalLink",
            resource_title: "Paraphrasing Guide",
            resource_url: "https://example.com/paraphrase-guide.pdf",
          },
        ],
      },
    ],
  },
];

/**
 * API Call Sequence
 * 
 * 1. POST /tutor/courses
 *    Body: { title, description, categoryID, language, duration, price, thumbnailURL }
 *    Response: { courseId: "3" }
 * 
 * 2. POST /tutor/courses/sections/3
 *    Body: { title, description, orderIndex }
 *    Response: { sectionId: "6" }
 * 
 * 3. POST /tutor/courses/sections/6/lessons
 *    Body: { title, duration, lessonType, videoURL, content, orderIndex }
 *    Response: { lessonId: "1" }
 * 
 * 4. POST /tutor/lessons/1/resources
 *    Body: { resourceType, resourceTitle, resourceURL }
 *    Response: { success: true }
 */

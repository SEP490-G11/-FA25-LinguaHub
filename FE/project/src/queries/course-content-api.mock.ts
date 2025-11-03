// Mock API for Course Content Management
// Phase 2: Mock API Layer with browser console debugging

import {
  CourseContentData,
  SectionData,
  LessonData,
  AddSectionFormData,
  AddLessonFormData,
} from '../pages/TutorPages/ManageCourseContent/types';

// In-memory data store
let mockCourseContent: Record<number, CourseContentData> = {
  1: {
    CourseID: 1,
    Title: 'Spanish for Beginners',
    Description: 'Learn Spanish from scratch with comprehensive lessons covering grammar, vocabulary, and conversation skills.',
    CategoryID: 'ielts',
    Languages: ['en'],
    Duration: 40,
    Price: 1500000,
    ThumbnailURL: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    Status: 'approved',
    Sections: [
      {
        SectionID: 1,
        CourseID: 1,
        Title: 'Introduction to Spanish',
        Description: 'Learn the basics of Spanish language',
        OrderIndex: 0,
        CreatedAt: '2024-01-01T10:00:00Z',
        Lessons: [
          {
            LessonID: 1,
            SectionID: 1,
            Title: 'Spanish Alphabet',
            Duration: 15,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=abc123',
            OrderIndex: 0,
            CreatedAt: '2024-01-01T10:30:00Z',
            Resources: [],
          },
          {
            LessonID: 2,
            SectionID: 1,
            Title: 'Basic Greetings',
            Duration: 20,
            LessonType: 'Reading',
            Content: 'Learn how to say hello, goodbye, and introduce yourself...',
            OrderIndex: 1,
            CreatedAt: '2024-01-01T11:00:00Z',
            Resources: [],
          },
        ],
      },
      {
        SectionID: 2,
        CourseID: 1,
        Title: 'Spanish Grammar',
        Description: 'Essential grammar rules',
        OrderIndex: 1,
        CreatedAt: '2024-01-02T10:00:00Z',
        Lessons: [
          {
            LessonID: 3,
            SectionID: 2,
            Title: 'Present Tense',
            Duration: 30,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=xyz789',
            OrderIndex: 0,
            CreatedAt: '2024-01-02T10:30:00Z',
            Resources: [],
          },
        ],
      },
    ],
  },
};

// Auto-increment IDs
let nextSectionId = 3;
let nextLessonId = 4;

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(Math.random() * 400 + 800); // 800-1200ms

// API Functions
export const mockCourseContentAPI = {
  // GET /api/courses/:id/content - Fetch full course content
  getCourseContent: async (courseId: number): Promise<CourseContentData> => {
    console.log('[Mock API] GET /api/courses/:id/content', { courseId });
    await randomDelay();

    const content = mockCourseContent[courseId];
    if (!content) {
      throw new Error('Course not found');
    }

    console.log('[Mock API] Response:', content);
    return JSON.parse(JSON.stringify(content)); // Deep clone
  },

  // POST /api/courses/:id/sections - Add section
  addSection: async (
    courseId: number,
    data: AddSectionFormData
  ): Promise<SectionData> => {
    console.log('[Mock API] POST /api/courses/:id/sections', { courseId, data });
    await randomDelay();

    const course = mockCourseContent[courseId];
    if (!course) {
      throw new Error('Course not found');
    }

    const newSection: SectionData = {
      SectionID: nextSectionId++,
      CourseID: courseId,
      Title: data.Title,
      Description: data.Description,
      OrderIndex: course.Sections.length,
      CreatedAt: new Date().toISOString(),
      Lessons: [],
    };

    course.Sections.push(newSection);
    console.log('[Mock API] Section added:', newSection);
    return JSON.parse(JSON.stringify(newSection));
  },

  // PUT /api/sections/:id - Update section
  updateSection: async (
    sectionId: number,
    data: AddSectionFormData
  ): Promise<SectionData> => {
    console.log('[Mock API] PUT /api/sections/:id', { sectionId, data });
    await randomDelay();

    for (const course of Object.values(mockCourseContent)) {
      const section = course.Sections.find((s) => s.SectionID === sectionId);
      if (section) {
        section.Title = data.Title;
        section.Description = data.Description;
        console.log('[Mock API] Section updated:', section);
        return JSON.parse(JSON.stringify(section));
      }
    }

    throw new Error('Section not found');
  },

  // DELETE /api/sections/:id - Delete section
  deleteSection: async (sectionId: number): Promise<void> => {
    console.log('[Mock API] DELETE /api/sections/:id', { sectionId });
    await randomDelay();

    for (const course of Object.values(mockCourseContent)) {
      const index = course.Sections.findIndex((s) => s.SectionID === sectionId);
      if (index !== -1) {
        course.Sections.splice(index, 1);
        // Reorder remaining sections
        course.Sections.forEach((s, idx) => {
          s.OrderIndex = idx;
        });
        console.log('[Mock API] Section deleted');
        return;
      }
    }

    throw new Error('Section not found');
  },

  // PUT /api/courses/:id/sections/reorder - Reorder sections
  reorderSections: async (
    courseId: number,
    sectionIds: number[]
  ): Promise<void> => {
    console.log('[Mock API] PUT /api/courses/:id/sections/reorder', {
      courseId,
      sectionIds,
    });
    await randomDelay();

    const course = mockCourseContent[courseId];
    if (!course) {
      throw new Error('Course not found');
    }

    // Reorder sections based on provided IDs
    const reorderedSections = sectionIds
      .map((id) => course.Sections.find((s) => s.SectionID === id))
      .filter((s): s is SectionData => s !== undefined);

    reorderedSections.forEach((section, index) => {
      section.OrderIndex = index;
    });

    course.Sections = reorderedSections;
    console.log('[Mock API] Sections reordered');
  },

  // POST /api/sections/:id/lessons - Add lesson
  addLesson: async (
    sectionId: number,
    data: AddLessonFormData
  ): Promise<LessonData> => {
    console.log('[Mock API] POST /api/sections/:id/lessons', { sectionId, data });
    await randomDelay();

    for (const course of Object.values(mockCourseContent)) {
      const section = course.Sections.find((s) => s.SectionID === sectionId);
      if (section) {
        const newLesson: LessonData = {
          LessonID: nextLessonId++,
          SectionID: sectionId,
          Title: data.Title,
          Duration: data.Duration,
          LessonType: data.LessonType,
          VideoURL: data.VideoURL,
          Content: data.Content,
          OrderIndex: section.Lessons?.length || 0,
          CreatedAt: new Date().toISOString(),
          Resources: [],
        };

        if (!section.Lessons) section.Lessons = [];
        section.Lessons.push(newLesson);
        console.log('[Mock API] Lesson added:', newLesson);
        return JSON.parse(JSON.stringify(newLesson));
      }
    }

    throw new Error('Section not found');
  },

  // PUT /api/lessons/:id - Update lesson
  updateLesson: async (
    lessonId: number,
    data: AddLessonFormData
  ): Promise<LessonData> => {
    console.log('[Mock API] PUT /api/lessons/:id', { lessonId, data });
    await randomDelay();

    for (const course of Object.values(mockCourseContent)) {
      for (const section of course.Sections) {
        const lesson = section.Lessons?.find((l) => l.LessonID === lessonId);
        if (lesson) {
          lesson.Title = data.Title;
          lesson.Duration = data.Duration;
          lesson.LessonType = data.LessonType;
          lesson.VideoURL = data.VideoURL;
          lesson.Content = data.Content;
          console.log('[Mock API] Lesson updated:', lesson);
          return JSON.parse(JSON.stringify(lesson));
        }
      }
    }

    throw new Error('Lesson not found');
  },

  // DELETE /api/lessons/:id - Delete lesson
  deleteLesson: async (lessonId: number): Promise<void> => {
    console.log('[Mock API] DELETE /api/lessons/:id', { lessonId });
    await randomDelay();

    for (const course of Object.values(mockCourseContent)) {
      for (const section of course.Sections) {
        const index = section.Lessons?.findIndex((l) => l.LessonID === lessonId) ?? -1;
        if (index !== -1) {
          section.Lessons?.splice(index, 1);
          // Reorder remaining lessons
          section.Lessons?.forEach((l, idx) => {
            l.OrderIndex = idx;
          });
          console.log('[Mock API] Lesson deleted');
          return;
        }
      }
    }

    throw new Error('Lesson not found');
  },

  // PUT /api/sections/:id/lessons/reorder - Reorder lessons
  reorderLessons: async (sectionId: number, lessonIds: number[]): Promise<void> => {
    console.log('[Mock API] PUT /api/sections/:id/lessons/reorder', {
      sectionId,
      lessonIds,
    });
    await randomDelay();

    for (const course of Object.values(mockCourseContent)) {
      const section = course.Sections.find((s) => s.SectionID === sectionId);
      if (section && section.Lessons) {
        // Reorder lessons based on provided IDs
        const reorderedLessons = lessonIds
          .map((id) => section.Lessons?.find((l) => l.LessonID === id))
          .filter((l): l is LessonData => l !== undefined);

        reorderedLessons.forEach((lesson, index) => {
          lesson.OrderIndex = index;
        });

        section.Lessons = reorderedLessons;
        console.log('[Mock API] Lessons reordered');
        return;
      }
    }

    throw new Error('Section not found');
  },
};

// Browser console debugging tools
if (typeof window !== 'undefined') {
  (window as any).__mockCourseContentAPI = {
    getCourseContent: (courseId: number) => mockCourseContent[courseId],
    getAllCourses: () => mockCourseContent,
    resetData: () => {
      mockCourseContent = {
        1: {
          CourseID: 1,
          Title: 'Spanish for Beginners',
          Sections: [],
        },
      };
      nextSectionId = 1;
      nextLessonId = 1;
      console.log('[Mock API] Data reset');
    },
    addCourse: (courseId: number, title: string) => {
      mockCourseContent[courseId] = {
        CourseID: courseId,
        Title: title,
        Sections: [],
      };
      console.log('[Mock API] Course added:', mockCourseContent[courseId]);
    },
  };

  console.log(
    '[Mock API] Course Content API loaded. Debug tools available at window.__mockCourseContentAPI'
  );
  console.log('Available commands:');
  console.log('  __mockCourseContentAPI.getCourseContent(1) - View course content');
  console.log('  __mockCourseContentAPI.getAllCourses() - View all courses');
  console.log('  __mockCourseContentAPI.resetData() - Reset to empty state');
  console.log('  __mockCourseContentAPI.addCourse(id, title) - Add a course');
}

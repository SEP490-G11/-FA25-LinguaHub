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
    Title: 'Advanced English Business Communication',
    Description: 'Comprehensive course for professionals looking to improve their business English skills.',
    CategoryID: 'toeic',
    Languages: ['en'],
    Duration: 40, // in hours
    Price: 750000,
    ThumbnailURL: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    Status: 'approved',
    Sections: [
      {
        SectionID: 1,
        CourseID: 1,
        Title: 'Business Email Writing',
        Description: 'Learn professional email communication',
        OrderIndex: 0,
        CreatedAt: '2024-01-15T10:00:00Z',
        Lessons: [
          {
            LessonID: 1,
            SectionID: 1,
            Title: 'Email Structure and Format',
            Duration: 30,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=abc123',
            OrderIndex: 0,
            CreatedAt: '2024-01-15T10:30:00Z',
            Resources: [],
          },
          {
            LessonID: 2,
            SectionID: 1,
            Title: 'Common Business Phrases',
            Duration: 25,
            LessonType: 'Reading',
            Content: 'Essential phrases for professional communication...',
            OrderIndex: 1,
            CreatedAt: '2024-01-15T11:00:00Z',
            Resources: [],
          },
        ],
      },
      {
        SectionID: 2,
        CourseID: 1,
        Title: 'Presentation Skills',
        Description: 'Master business presentations in English',
        OrderIndex: 1,
        CreatedAt: '2024-01-15T12:00:00Z',
        Lessons: [
          {
            LessonID: 3,
            SectionID: 2,
            Title: 'Creating Effective Slides',
            Duration: 40,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=xyz789',
            OrderIndex: 0,
            CreatedAt: '2024-01-15T12:30:00Z',
            Resources: [],
          },
        ],
      },
    ],
  },
  2: {
    CourseID: 2,
    Title: 'English Conversation for Beginners',
    Description: 'Perfect course for beginners who want to start speaking English confidently.',
    CategoryID: 'toeic',
    Languages: ['en'],
    Duration: 30, // in hours
    Price: 450000,
    ThumbnailURL: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    Status: 'pending',
    Sections: [
      {
        SectionID: 3,
        CourseID: 2,
        Title: 'Basic Conversations',
        Description: 'Start speaking English with confidence',
        OrderIndex: 0,
        CreatedAt: '2024-01-14T14:00:00Z',
        Lessons: [
          {
            LessonID: 4,
            SectionID: 3,
            Title: 'Introducing Yourself',
            Duration: 20,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=intro123',
            OrderIndex: 0,
            CreatedAt: '2024-01-14T14:30:00Z',
            Resources: [],
          },
        ],
      },
    ],
  },
  3: {
    CourseID: 3,
    Title: 'IELTS Speaking Preparation',
    Description: 'Intensive IELTS speaking preparation course with mock tests.',
    CategoryID: 'ielts',
    Languages: ['en'],
    Duration: 35, // in hours
    Price: 680000,
    ThumbnailURL: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    Status: 'approved',
    Sections: [
      {
        SectionID: 4,
        CourseID: 3,
        Title: 'IELTS Speaking Part 1',
        Description: 'Master the introduction and interview section',
        OrderIndex: 0,
        CreatedAt: '2024-01-13T09:00:00Z',
        Lessons: [
          {
            LessonID: 5,
            SectionID: 4,
            Title: 'Common Part 1 Topics',
            Duration: 35,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=ielts123',
            OrderIndex: 0,
            CreatedAt: '2024-01-13T09:30:00Z',
            Resources: [],
          },
        ],
      },
    ],
  },
  4: {
    CourseID: 4,
    Title: 'Korean Language Fundamentals',
    Description: 'Learn Korean from scratch with systematic approach to grammar and vocabulary.',
    CategoryID: 'topik',
    Languages: ['ko'],
    Duration: 60, // in hours
    Price: 550000,
    ThumbnailURL: 'https://images.pexels.com/photos/4006576/pexels-photo-4006576.jpeg?auto=compress&cs=tinysrgb&w=800',
    Status: 'draft',
    Sections: [
      {
        SectionID: 5,
        CourseID: 4,
        Title: 'Hangul Basics',
        Description: 'Learn the Korean alphabet',
        OrderIndex: 0,
        CreatedAt: '2024-01-12T16:00:00Z',
        Lessons: [
          {
            LessonID: 6,
            SectionID: 5,
            Title: 'Korean Vowels',
            Duration: 25,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=korean123',
            OrderIndex: 0,
            CreatedAt: '2024-01-12T16:30:00Z',
            Resources: [],
          },
        ],
      },
    ],
  },
  5: {
    CourseID: 5,
    Title: 'Japanese for Travel',
    Description: 'Essential Japanese phrases and cultural insights for travelers.',
    CategoryID: 'jlpt',
    Languages: ['ja'],
    Duration: 20, // in hours
    Price: 400000,
    ThumbnailURL: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
    Status: 'rejected',
    Sections: [
      {
        SectionID: 6,
        CourseID: 5,
        Title: 'Travel Essentials',
        Description: 'Key phrases for traveling in Japan',
        OrderIndex: 0,
        CreatedAt: '2024-01-11T11:00:00Z',
        Lessons: [
          {
            LessonID: 7,
            SectionID: 6,
            Title: 'At the Airport',
            Duration: 20,
            LessonType: 'Video',
            VideoURL: 'https://youtube.com/watch?v=japan123',
            OrderIndex: 0,
            CreatedAt: '2024-01-11T11:30:00Z',
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

  // PUT /api/courses/:id - Update course basic information
  updateCourseInfo: async (
    courseId: number,
    data: {
      Title?: string;
      Description?: string;
      CategoryID?: string;
      Languages?: string[];
      Duration?: number;
      Price?: number;
      ThumbnailURL?: string;
    }
  ): Promise<CourseContentData> => {
    console.log('[Mock API] PUT /api/courses/:id', { courseId, data });
    await randomDelay();

    const course = mockCourseContent[courseId];
    if (!course) {
      throw new Error('Course not found');
    }

    // Update course fields
    if (data.Title !== undefined) course.Title = data.Title;
    if (data.Description !== undefined) course.Description = data.Description;
    if (data.CategoryID !== undefined) course.CategoryID = data.CategoryID;
    if (data.Languages !== undefined) course.Languages = data.Languages;
    if (data.Duration !== undefined) course.Duration = data.Duration;
    if (data.Price !== undefined) course.Price = data.Price;
    if (data.ThumbnailURL !== undefined) course.ThumbnailURL = data.ThumbnailURL;

    console.log('[Mock API] Course info updated:', course);
    return JSON.parse(JSON.stringify(course)); // Deep clone
  },

  // PUT /api/courses/:id/content - Batch update course content (sections + lessons)
  updateCourseContent: async (
    courseId: number,
    sections: SectionData[]
  ): Promise<CourseContentData> => {
    console.log('[Mock API] PUT /api/courses/:id/content', { courseId, sections });
    await randomDelay();

    const course = mockCourseContent[courseId];
    if (!course) {
      throw new Error('Course not found');
    }

    // Replace all sections with new data
    course.Sections = sections.map((section, sectionIndex) => ({
      SectionID: section.SectionID || nextSectionId++,
      CourseID: courseId,
      Title: section.Title,
      Description: section.Description,
      OrderIndex: sectionIndex,
      CreatedAt: section.CreatedAt || new Date().toISOString(),
      Lessons: (section.Lessons || []).map((lesson, lessonIndex) => ({
        LessonID: lesson.LessonID || nextLessonId++,
        SectionID: section.SectionID || 0,
        Title: lesson.Title,
        Duration: lesson.Duration,
        LessonType: lesson.LessonType,
        VideoURL: lesson.VideoURL,
        Content: lesson.Content,
        OrderIndex: lessonIndex,
        CreatedAt: lesson.CreatedAt || new Date().toISOString(),
        Resources: lesson.Resources || [],
      })),
    }));

    console.log('[Mock API] Course content updated:', course);
    return JSON.parse(JSON.stringify(course)); // Deep clone
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

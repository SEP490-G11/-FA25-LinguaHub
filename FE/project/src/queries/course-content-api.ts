// API Wrapper for Course Content Management
// Toggle between Mock and Real API

import { mockCourseContentAPI } from './course-content-api.mock';
import {
  CourseContentData,
  SectionData,
  LessonData,
  AddSectionFormData,
  AddLessonFormData,
} from '../pages/TutorPages/ManageCourseContent/types';

// Toggle this to switch between mock and real API
const USE_MOCK_API = true;

// Real API functions (to be implemented when backend is ready)
const realAPI = {
  getCourseContent: async (courseId: number): Promise<CourseContentData> => {
    const response = await fetch(`/api/courses/${courseId}/content`);
    if (!response.ok) throw new Error('Failed to fetch course content');
    return response.json();
  },

  addSection: async (
    courseId: number,
    data: AddSectionFormData
  ): Promise<SectionData> => {
    const response = await fetch(`/api/courses/${courseId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add section');
    return response.json();
  },

  updateSection: async (
    sectionId: number,
    data: AddSectionFormData
  ): Promise<SectionData> => {
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update section');
    return response.json();
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    const response = await fetch(`/api/sections/${sectionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete section');
  },

  reorderSections: async (courseId: number, sectionIds: number[]): Promise<void> => {
    const response = await fetch(`/api/courses/${courseId}/sections/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionIds }),
    });
    if (!response.ok) throw new Error('Failed to reorder sections');
  },

  addLesson: async (
    sectionId: number,
    data: AddLessonFormData
  ): Promise<LessonData> => {
    const response = await fetch(`/api/sections/${sectionId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add lesson');
    return response.json();
  },

  updateLesson: async (
    lessonId: number,
    data: AddLessonFormData
  ): Promise<LessonData> => {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update lesson');
    return response.json();
  },

  deleteLesson: async (lessonId: number): Promise<void> => {
    const response = await fetch(`/api/lessons/${lessonId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete lesson');
  },

  reorderLessons: async (sectionId: number, lessonIds: number[]): Promise<void> => {
    const response = await fetch(`/api/sections/${sectionId}/lessons/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonIds }),
    });
    if (!response.ok) throw new Error('Failed to reorder lessons');
  },
};

// Export the appropriate API based on the toggle
export const courseContentAPI = USE_MOCK_API ? mockCourseContentAPI : realAPI;

// Log which API is being used
console.log(
  `[Course Content API] Using ${USE_MOCK_API ? 'Mock' : 'Real'} API`
);

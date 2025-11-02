// ==========================================================
// SUPPORTING TYPES (Inferred/Extended from Schema)
// ==========================================================

// Language (from Courses.Language, Tutor.TeachingLanguage)
import {Lesson} from "@/types/Course.ts";
import {Schedule} from "framer-motion";

export interface Language {
    name: string;
    code?: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Availability (from Schedule)
export interface Availability {
    timezone?: string;
    schedules: Schedule[];
}

// WeekCurriculum (from CourseSection/Lessons)
export interface WeekCurriculum {
    week: number;
    title: string;
    lessons: Lesson[];
}

// Material/Resource (from LessonResource)
export interface Material {
    id: number;
    title?: string;
    type: 'PDF' | 'ExternalLink';
    size?: string;
    downloadUrl: string;
}

// Comment/Reply (from CourseReview/Feedback)
export interface Comment {
    id: number;
    userId: string;
    message: string;
    createdAt: string;
    replies?: Reply[];
}

export interface Reply {
    id: number;
    userId: string;
    message: string;
    createdAt: string;
}

// Practice Test (inferred from Courses/Lessons; no direct table)
export interface PracticeTest {
    id: number;
    title: string;
    language: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    questions: number;
    participants: number;
    rating: number;
    price?: number;
    description?: string;
}
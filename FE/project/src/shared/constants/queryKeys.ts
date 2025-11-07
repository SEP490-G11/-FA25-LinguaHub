// Query Keys
export const QUERY_KEYS = {
    COURSES: ['courses'],
    COURSE_DETAIL: (id: string) => ['courses', id],
    TUTORS: ['tutors'],
    TUTOR_DETAIL: (id: string) => ['tutors', id],
    LESSONS: ['lessons'],
    LESSON_DETAIL: (id: string) => ['lessons', id],
    PRACTICE_TESTS: ['practice-tests'],
    USER_PROFILE: ['user', 'profile'],
} as const;

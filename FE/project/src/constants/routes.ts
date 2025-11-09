
// Routes (Expanded to cover all from AppRoutes + Header)
export const ROUTES = {
    HOME: '/',
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    LANGUAGES: '/languages',
    TUTORS: '/list-tutors',
    TUTOR_DETAIL: '/tutors-Detail/:id',
    COURSE_DETAIL: '/course/:id',
    LESSON_DETAIL: '/lesson/:id',
    PRACTICE_TEST: '/practice-test',
    BECOME_TUTOR: '/become-tutor',
    WISHLIST: '/wishlist',
    PAYMENT: '/payment/:id',
    POLICY: '/policy',
    CHANGE_PASSWORD: '/change-password',
    VERIFY_EMAIL_FORGOT_PASSWORD:'/auth/verify-email-forgot-password',
    // Auth routes
    COMPLETE_FORGOT_PASSWORD: '/auth/complete-forgot-password',
    GOOGLE_CALLBACK: '/auth/google-callback',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',

    // Course/Tutor routes
    CREATE_COURSE: '/create-course',
    PENDING_COURSES: '/admin/pending-courses',
    TUTOR_DASHBOARD: '/tutor/dashboard',
    TUTOR_COURSES: '/tutor/courses',
    MY_COURSES: '/my-courses',
    LANGUAGE_COURSES: '/languages/:language',  // Dynamic

    // User pages (from Header)
    PROFILE: '/profile',
    PAYMENT_HISTORY: '/payment-history',
    MY_ENROLLMENTS: '/my-enrollments',
    APPLY_TUTOR: '/learner/apply-tutor',
    SETTINGS: '/settings',
} as const;

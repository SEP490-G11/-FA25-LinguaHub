
// Routes (Expanded to cover all from AppRoutes + Header)
export const ROUTES = {
    HOME: '/',
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    LANGUAGES: '/languages',
    TUTORS: '/tutors',
    TUTOR_DETAIL: '/tutors/:id',
    COURSE_DETAIL: '/courses/:id',
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
    TUTOR_DASHBOARD: '/dashboard',
    TUTOR_COURSES: '/courses',
    TUTOR_PACKAGES: '/packages',
    MY_COURSES: '/my-courses',
    LANGUAGE_COURSES: '/languages/:language',  // Dynamic

    // User pages (from Header)
    PROFILE: '/profile',
    PAYMENT_HISTORY: '/payment-history',
    MY_ENROLLMENTS: '/my-enrollments',
    APPLY_TUTOR: '/learner/apply-tutor',
    SETTINGS: '/settings',

    // Course editing routes
    EDIT_COURSE: '/courses/:courseId/content',
    EDIT_COURSE_DRAFT: '/courses/:courseId/draft/:draftId/content',

    // Admin routes
    ADMIN_USER_MANAGEMENT: '/admin/user-management',
    ADMIN_WITHDRAW_REQUESTS: '/admin/withdraw-requests',
    ADMIN_PAYMENTS: '/admin/payments',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    
    // Refund
    REFUND_REQUESTS: '/learner/refunds',
} as const;

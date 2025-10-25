// API Endpoints (Updated to match backend endpoints)
export const API_ENDPOINTS = {
  AUTH: {
    TOKEN: '/auth/token',  // Sign in
    REGISTER: '/auth/register',  // Sign up
    LOGOUT: '/auth/logout',
    INTROSPECT: '/auth/introspect',  // Check auth
    FORGOT_PASSWORD: '/auth/forgot-password',
    SET_NEW_PASSWORD: '/auth/set-new-password',
    VERIFY: '/auth/verify',
    VERIFY_RESET_OTP: '/auth/verify-reset-otp',
  },
  USERS: {
    LIST: '/users',
    MY_INFO: '/users/myInfo',
    CHANGE_PASSWORD: '/users/change-password',
    DETAIL: '/users/:userID',
    UPDATE: '/users/:userID',  // PATCH
    DELETE: '/users/:userID',  // DELETE
  },
  ROLES: {
    LIST: '/roles',
    CREATE: '/roles',
    DETAIL: '/roles/:roleName',  // PUT
    DELETE: '/roles/:role',  // DELETE
  },
  PERMISSIONS: {
    LIST: '/permissions',
    CREATE: '/permissions',
    DELETE: '/permissions/:permission',
  },
  TUTORS: {
    APPLY: '/tutors/apply',
    APPLY_STATUS: '/tutors/apply/status',
  },
  TUTOR_TESTS: {
    APPLY: '/test/tutors/apply/:userId',
    STATUS: '/test/tutors/status/:userId',
    PENDING: '/test/tutors/pending',
    DETAIL: '/test/tutors/detail/:verificationId',
    ALL: '/test/tutors/all',
    APPROVE: '/test/tutors/approve/:verificationId/:adminId',
    REJECT: '/test/tutors/reject/:verificationId/:adminId',
  },
  ADMIN_TUTORS: {
    ALL: '/admin/tutors/all',
    DETAIL: '/admin/tutors/:tutorId',  // PATCH
    SUSPEND: '/admin/tutors/:tutorId/suspend',
    UNSUSPEND: '/admin/tutors/:tutorId/unsuspend',
    APPLICATIONS_PENDING: '/admin/tutors/applications/pending',
    APPLICATION_DETAIL: '/admin/tutors/applications/:verificationId',
    APPROVE_APPLICATION: '/admin/tutors/applications/:verificationId/approve',
    REJECT_APPLICATION: '/admin/tutors/applications/:verificationId/reject',
  },
  TESTS: {
    API_TEST: '/api/test',
    EMAIL_TEST: '/api/test/email',
  },
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
} as const;

// Language Levels
export const LANGUAGE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

// Languages
export const LANGUAGES = [
  { name: 'English', flag: '🇺🇸', code: 'en' },
  { name: 'Spanish', flag: '🇪🇸', code: 'es' },
  { name: 'French', flag: '🇫🇷', code: 'fr' },
  { name: 'German', flag: '🇩🇪', code: 'de' },
  { name: 'Chinese', flag: '🇨🇳', code: 'zh' },
  { name: 'Japanese', flag: '🇯🇵', code: 'ja' },
  { name: 'Korean', flag: '🇰🇷', code: 'ko' },
  { name: 'Italian', flag: '🇮🇹', code: 'it' },
] as const;

// Price Ranges
export const PRICE_RANGES = [
  { label: 'All', value: 'All' },
  { label: '$15-25', value: '15-25' },
  { label: '$25-35', value: '25-35' },
  { label: '$35+', value: '35+' },
] as const;

// Colors
export const COLORS = {
  PRIMARY: 'hsl(221.2 83.2% 53.3%)',
  SECONDARY: 'hsl(210 40% 96%)',
  SUCCESS: 'hsl(142.1 76.2% 36.3%)',
  WARNING: 'hsl(47.9 95.8% 53.1%)',
  ERROR: 'hsl(0 84.2% 60.2%)',
} as const;

// Messages
export const MESSAGES = {
  SUCCESS: {
    SIGN_IN: 'Đăng nhập thành công!',
    SIGN_UP: 'Đăng ký thành công!',
    COURSE_ENROLLED: 'Đăng ký khóa học thành công!',
    LESSON_COMPLETED: 'Hoàn thành bài học!',
  },
  ERROR: {
    SIGN_IN_FAILED: 'Đăng nhập thất bại. Vui lòng thử lại.',
    SIGN_UP_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
    NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra internet.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập.',
  },
  VALIDATION: {
    REQUIRED: 'Trường này là bắt buộc',
    EMAIL_INVALID: 'Email không hợp lệ',
    PASSWORD_MIN: 'Mật khẩu phải có ít nhất 6 ký tự',
    PASSWORDS_NOT_MATCH: 'Mật khẩu không khớp',
    PHONE_INVALID: 'Số điện thoại không hợp lệ',
  },
} as const;

// Routes (Expanded to cover all from AppRoutes + Header)
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  LANGUAGES: '/languages',
  TUTORS: '/tutors',
  TUTOR_DETAIL: '/tutor/:id',
  COURSE_DETAIL: '/course/:id',
  LESSON_DETAIL: '/lesson/:id',  // Adjusted to match AppRoutes; use dynamic params as needed
  PRACTICE_TEST: '/practice-test',
  BECOME_TUTOR: '/become-tutor',
  WISHLIST: '/wishlist',
  PAYMENT: '/payment/:id',
  POLICY: '/policy',

  // Auth routes
  COMPLETE_FORGOT_PASSWORD: '/auth/complete-forgot-password',
  GOOGLE_CALLBACK: '/auth/google-callback',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',

  // Course/Tutor routes
  CREATE_COURSE: '/create-course',
  PENDING_COURSES: '/admin/pending-courses',
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

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

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
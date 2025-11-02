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

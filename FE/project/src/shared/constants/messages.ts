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

//định nghĩa kiểu dữ liệu (Type Definitions) cho toàn bộ Frontend.
//Mỗi object API trả về có cấu trúc thế nào,
// Các thuộc tính trong object tên gì, kiểu gì,
// Thuộc tính nào bắt buộc / tùy chọn,
// Và đảm bảo bạn không truyền sai dữ liệu khi code.



// ==========================================================
// 2. TUTOR TYPES
// ==========================================================



// ==========================================================
// 3. COURSE & LESSON TYPES
// ==========================================================



// ==========================================================
// 4. SERVICES & BENEFITS
// ==========================================================

// ==========================================================
// 6. CHAT & POLICY
// ==========================================================



// ==========================================================
// API RESPONSE & FORM TYPES (Updated)
// ==========================================================

// ApiResponse (match BE { result, message })
export interface ApiResponse<T> {
  result: T;
  message?: string;
  code?: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  result: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Forms (for /auth/token & /auth/register)
export interface SignInForm {
  username: string;  // BE /auth/token uses username (from Email or separate?)
  password: string;
  rememberMe?: boolean;
}

export interface SignUpForm {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  // Add role?: 'Learner' if selectable
}

// Filters (client-side)
export interface CourseFilters {
  language: string;
  level: string;
  priceRange: string;
  categoryId?: number;
  status?: 'Approved';
}

export interface TutorFilters {
  language: string;
  priceRange: string;
  status?: 'Approved';
}
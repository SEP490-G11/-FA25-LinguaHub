
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
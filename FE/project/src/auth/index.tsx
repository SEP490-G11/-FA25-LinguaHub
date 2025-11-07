/**
 * Auth module - Export tất cả auth & role related utilities
 * 
 * @example
 * import { useRole, ProtectedRoute, isAdmin } from '@/auth';
 */

// Types
export type { User, UserRole } from './types';

// Pure functions (có thể dùng ở bất kỳ đâu)
export {
  getUser,
  getUserRole,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  isAdmin,
  isTutor,
  isStudent,
} from './helpers';

// React Hook (dùng trong component)
export { useRole } from './useRole';

// React Component (dùng trong routes)
export { ProtectedRoute } from './ProtectedRoute';

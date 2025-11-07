/**
 * Component để bảo vệ route theo role
 */

import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { getUserRole } from './helpers';
import type { UserRole } from './types';

interface ProtectedRouteProps {
  /** Component con sẽ render nếu có quyền */
  children: ReactNode;
  /** Danh sách role được phép truy cập */
  allowedRoles?: UserRole[];
  /** Đường dẫn redirect nếu không có quyền */
  redirectTo?: string;
}

/**
 * Component bảo vệ route theo role
 * 
 * @example
 * // Chỉ Admin mới truy cập được
 * <ProtectedRoute allowedRoles={['Admin']}>
 *   <AdminPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Admin hoặc Tutor mới truy cập được
 * <ProtectedRoute allowedRoles={['Admin', 'Tutor']}>
 *   <CreateCoursePage />
 * </ProtectedRoute>
 * 
 * @example
 * // Chỉ cần login (không check role)
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/',
}: ProtectedRouteProps) => {
  const userRole = getUserRole();

  // Chưa login → redirect to login
  if (!userRole) {
    return <Navigate to="/auth/login" replace />;
  }

  // Đã login nhưng không có role phù hợp → redirect
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  // OK - cho phép truy cập
  return <>{children}</>;
};

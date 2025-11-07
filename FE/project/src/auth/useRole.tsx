/**
 * React Hook để kiểm tra role trong component
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole, isAuthenticated, hasRole, hasAnyRole, isAdmin, isTutor, isStudent } from './helpers';
import type { UserRole } from './types';

/**
 * Hook để kiểm tra role trong React component
 * Tự động redirect nếu không có quyền
 * 
 * @param allowedRoles - Danh sách role được phép (optional)
 * @param redirectTo - Đường dẫn redirect nếu không có quyền
 * 
 * @example
 * // Chỉ cho phép Admin và Tutor
 * const { isAuthorized, currentRole } = useRole(['Admin', 'Tutor']);
 * if (!isAuthorized) return <div>No access</div>;
 * 
 * @example
 * // Chỉ cần login (không check role cụ thể)
 * const { isAuthenticated } = useRole();
 */
export const useRole = (allowedRoles?: UserRole[], redirectTo: string = '/') => {
  const navigate = useNavigate();
  const currentRole = getUserRole();
  const isUserAuthenticated = isAuthenticated();
  const isAuthorized = !allowedRoles || (currentRole ? allowedRoles.includes(currentRole) : false);

  useEffect(() => {
    // Chưa login → redirect to login
    if (!isUserAuthenticated) {
      navigate('/auth/login', { replace: true });
      return;
    }

    // Đã login nhưng không có quyền → redirect
    if (allowedRoles && !isAuthorized) {
      navigate(redirectTo, { replace: true });
    }
  }, [isUserAuthenticated, isAuthorized, navigate, redirectTo, allowedRoles]);

  return {
    currentRole,
    isAuthenticated: isUserAuthenticated,
    isAuthorized,
    // Re-export helper functions để dùng trong component
    hasRole: (role: UserRole) => hasRole(role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(roles),
    isAdmin: () => isAdmin(),
    isTutor: () => isTutor(),
    isStudent: () => isStudent(),
  };
};

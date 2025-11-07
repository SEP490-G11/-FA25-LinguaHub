/**
 * Pure functions để kiểm tra role và authentication
 * Không sử dụng React - có thể dùng ở bất kỳ đâu
 */

import type { User, UserRole } from './types';

/**
 * Lấy thông tin user từ localStorage
 */
export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Lấy role của user hiện tại
 */
export const getUserRole = (): UserRole | null => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Kiểm tra user đã login chưa
 */
export const isAuthenticated = (): boolean => {
  return !!getUser();
};

/**
 * Kiểm tra user có role cụ thể không
 * @example hasRole('Admin')
 */
export const hasRole = (role: UserRole): boolean => {
  return getUserRole() === role;
};

/**
 * Kiểm tra user có bất kỳ role nào trong danh sách không
 * @example hasAnyRole(['Admin', 'Tutor'])
 */
export const hasAnyRole = (roles: UserRole[]): boolean => {
  const userRole = getUserRole();
  return userRole ? roles.includes(userRole) : false;
};

/**
 * Shortcut functions
 */
export const isAdmin = (): boolean => hasRole('Admin');
export const isTutor = (): boolean => hasRole('Tutor');
export const isStudent = (): boolean => hasRole('Student');

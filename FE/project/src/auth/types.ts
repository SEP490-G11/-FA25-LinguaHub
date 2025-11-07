/**
 * Auth & Role related types
 */

export type UserRole = 'Admin' | 'Tutor' | 'Student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

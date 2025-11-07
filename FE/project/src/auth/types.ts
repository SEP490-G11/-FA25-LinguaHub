/**
 * Auth & Role related types
 */

// Backend trả về: 'Admin' | 'Tutor' | 'Learner'
export type UserRole = 'Admin' | 'Tutor' | 'Learner';

export interface User {
  userID: string;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string;
  avatarURL?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  phone?: string;
  country?: string;
  address?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

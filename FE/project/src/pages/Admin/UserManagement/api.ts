import axios from '@/config/axiosConfig';
import { User, UsersResponse, DeleteUserResponse } from './types';

/**
 * Admin API for User Management
 * Following the same pattern as TutorApproval API
 */
export const userManagementApi = {
  /**
   * Get all users from the system
   * Endpoint: GET /users
   * Requirements: 1.1, 1.3 - retrieve all user records with proper error handling
   */
  getUsers: async (): Promise<User[]> => {
    try {
      // TEMPORARY: Return mock data for testing
      // TODO: Replace with actual API call when backend is ready
      const mockUsers: User[] = [
        {
          userID: 1,
          username: 'admin',
          email: 'admin@linguahub.com',
          fullName: 'System Administrator',
          avatarURL: '',
          gender: 'Male',
          dob: '1990-01-01',
          phone: '0987654321',
          country: 'Vietnam',
          address: 'Ho Chi Minh City',
          bio: 'System administrator',
          isActive: true,
          role: 'Admin',
          createdAt: '2023-11-10T00:00:00Z',
          updatedAt: '2023-11-10T00:00:00Z',
        },
        {
          userID: 2,
          username: 'phatvv',
          email: 'phatuzumaki@gmail.com',
          fullName: 'Phat Vu',
          avatarURL: '',
          gender: 'Male',
          dob: '2001-05-20',
          phone: '0987654321',
          country: 'Vietnam',
          address: 'Ho Chi Minh City',
          bio: 'Tutor',
          isActive: true,
          role: 'Tutor',
          createdAt: '2023-11-10T00:00:00Z',
          updatedAt: '2023-11-10T00:00:00Z',
        },
        {
          userID: 3,
          username: 'tutor01',
          email: 'tutor01@linguahub.com',
          fullName: 'Jane Smith',
          avatarURL: '',
          gender: 'Female',
          dob: '1985-03-15',
          phone: '',
          country: 'Vietnam',
          address: '',
          bio: '',
          isActive: true,
          role: 'Tutor',
          createdAt: '2023-11-10T00:00:00Z',
          updatedAt: '2023-11-10T00:00:00Z',
        },
        {
          userID: 4,
          username: 'learner01',
          email: 'learner01@linguahub.com',
          fullName: 'John Nguyen',
          avatarURL: '',
          gender: 'Male',
          dob: '1995-07-22',
          phone: '',
          country: 'Vietnam',
          address: '',
          bio: '',
          isActive: true,
          role: 'Learner',
          createdAt: '2023-11-10T00:00:00Z',
          updatedAt: '2023-11-10T00:00:00Z',
        },
        {
          userID: 5,
          username: 'learner02',
          email: 'learner02@linguahub.com',
          fullName: 'Minh Tran',
          avatarURL: '',
          gender: 'Female',
          dob: '1992-12-08',
          phone: '',
          country: 'Vietnam',
          address: '',
          bio: '',
          isActive: true,
          role: 'Learner',
          createdAt: '2023-11-10T00:00:00Z',
          updatedAt: '2023-11-10T00:00:00Z',
        },
        {
          userID: 6,
          username: 'phatvvv',
          email: 'demngay1234@gmail.com',
          fullName: 'phat vu',
          avatarURL: '',
          gender: 'Male',
          dob: '2002-02-14',
          phone: '1111111111',
          country: '',
          address: '',
          bio: '',
          isActive: true,
          role: 'Admin',
          createdAt: '2023-11-15T00:00:00Z',
          updatedAt: '2023-11-15T00:00:00Z',
        },
        {
          userID: 7,
          username: 'phatv',
          email: 'phatvhe170322@fpt.edu.vn',
          fullName: 'phat vu',
          avatarURL: '',
          gender: 'Male',
          dob: '2000-03-16',
          phone: '11111111111111111',
          country: '',
          address: '',
          bio: '',
          isActive: true,
          role: 'Learner',
          createdAt: '2023-11-16T00:00:00Z',
          updatedAt: '2023-11-16T00:00:00Z',
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockUsers;
      
      // ACTUAL API CALL (commented out for now):
      /*
      // Backend endpoint: GET /users
      const response = await axios.get<UsersResponse>('/users');
      
      // Check if response indicates success (code 0)
      if (response?.data?.code !== 0) {
        throw new Error(response?.data?.message || 'Failed to fetch users');
      }
      
      // Backend returns array in result field
      const backendData = response?.data?.result || [];
      
      // Ensure it's an array
      if (!Array.isArray(backendData)) {
        throw new Error('Invalid response format: expected array of users');
      }
      
      // Transform backend data to match User interface
      const users: User[] = backendData.map((item: any) => ({
        userID: item.userID || 0,
        username: item.username || '',
        email: item.email || '',
        fullName: item.fullName || '',
        avatarURL: item.avatarURL || '',
        gender: item.gender || '',
        dob: item.dob || '',
        phone: item.phone || '',
        country: item.country || '',
        address: item.address || '',
        bio: item.bio || '',
        isActive: Boolean(item.isActive),
        role: item.role || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));

      return users;
      */
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch users'
      );
    }
  },

  /**
   * Delete a specific user by userID
   * Endpoint: DELETE /users/{userID}
   * Requirements: 2.2, 2.3, 2.4 - delete user with proper error handling
   */
  deleteUser: async (userID: number): Promise<void> => {
    try {
      // Backend endpoint: DELETE /users/{userID}
      const response = await axios.delete<DeleteUserResponse>(`/users/${userID}`);
      
      // Check if response indicates success (code 0)
      if (response?.data?.code !== 0) {
        throw new Error(response?.data?.message || 'Failed to delete user');
      }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || 
        error.message || 
        'Failed to delete user'
      );
    }
  },
};

export default userManagementApi;
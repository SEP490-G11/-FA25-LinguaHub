import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserRow } from './UserRow';
import { User } from '../types';

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
  onRemoveUser: (userID: number) => void;
  onAddUser: (user: User) => void;
  isRefreshing?: boolean;
}

/**
 * UserTable component for user list display
 * Requirements: 1.2, 3.1, 3.2, 3.3, 4.4 - responsive table layout, user status indicators, role display, empty state handling
 */
export const UserTable: React.FC<UserTableProps> = ({ users, onRefresh, onRemoveUser, onAddUser, isRefreshing = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all">
      {/* ========== TABLE HEADER ========== */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Users List</h2>
            <p className="text-gray-600 text-sm mt-1" aria-live="polite">
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-semibold disabled:opacity-50 w-full sm:w-auto"
            aria-label={isRefreshing ? 'Refreshing user list' : 'Refresh user list'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* ========== RESPONSIVE TABLE ========== */}
      <div className="overflow-x-auto" role="region" aria-label="Users table" tabIndex={0}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-center" scope="col">#</TableHead>
              <TableHead className="w-16" scope="col">
                <span className="sr-only">Avatar</span>
              </TableHead>
              <TableHead className="w-16 text-center" scope="col">ID</TableHead>
              <TableHead className="min-w-[180px]" scope="col">User Info</TableHead>
              <TableHead className="min-w-[180px]" scope="col">Contact</TableHead>
              <TableHead className="min-w-[100px]" scope="col">Status</TableHead>
              <TableHead className="min-w-[80px]" scope="col">Gender</TableHead>
              <TableHead className="min-w-[100px]" scope="col">Role</TableHead>
              <TableHead className="min-w-[150px]" scope="col">Dates</TableHead>
              <TableHead className="w-[120px] text-center" scope="col">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <UserRow 
                key={user.userID} 
                user={user} 
                index={index + 1}
                onRemoveUser={onRemoveUser}
                onAddUser={onAddUser}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ========== TABLE FOOTER ========== */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="text-sm text-gray-600 text-center space-y-1 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-4">
            <span>Total: {users.length} user{users.length !== 1 ? 's' : ''}</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span>Active: {users.filter(u => u.isActive).length}</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span>Inactive: {users.filter(u => !u.isActive).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
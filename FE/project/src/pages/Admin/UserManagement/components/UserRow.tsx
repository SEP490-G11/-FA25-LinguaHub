import React, { useState } from 'react';
import { Trash2, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { User as UserType } from '../types';

interface UserRowProps {
  user: UserType;
  index: number;
  onRemoveUser: (userID: number) => void;
  onAddUser: (user: UserType) => void;
}

/**
 * UserRow component for individual user display
 * Requirements: 1.2, 3.1, 3.2, 3.3 - display all user fields, action buttons, avatar with fallback
 */
export const UserRow: React.FC<UserRowProps> = ({ user, index, onRemoveUser, onAddUser }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Format dates for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Generate avatar fallback from user's name
  const getAvatarFallback = (fullName: string, username: string) => {
    if (fullName && fullName.trim()) {
      const names = fullName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    return username ? username[0].toUpperCase() : 'U';
  };

  // Truncate long text for display
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50 focus-within:bg-gray-50">
        {/* ========== INDEX ========== */}
        <TableCell className="text-center">
          <div className="text-sm font-medium text-gray-600">
            {index}
          </div>
        </TableCell>

        {/* ========== AVATAR ========== */}
        <TableCell>
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user.avatarURL} 
              alt={`${user.fullName || user.username}'s avatar`}
            />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
              {getAvatarFallback(user.fullName, user.username)}
            </AvatarFallback>
          </Avatar>
        </TableCell>

        {/* ========== ID ========== */}
        <TableCell className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {user.userID}
          </div>
        </TableCell>

        {/* ========== USER INFO ========== */}
        <TableCell>
          <div className="space-y-1">
            <div className="font-semibold text-gray-900">
              {user.fullName || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <User className="w-3 h-3" aria-hidden="true" />
              <span>{user.username}</span>
            </div>
          </div>
        </TableCell>

        {/* ========== CONTACT INFO ========== */}
        <TableCell>
          <div className="space-y-1">
            <div className="text-sm text-gray-900 flex items-center gap-1">
              <Mail className="w-3 h-3" aria-hidden="true" />
              <span className="truncate max-w-[150px]" title={user.email}>
                {user.email || 'N/A'}
              </span>
            </div>
            {user.phone && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Phone className="w-3 h-3" aria-hidden="true" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.country && (
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                <span>{user.country}</span>
              </div>
            )}
          </div>
        </TableCell>

        {/* ========== STATUS ========== */}
        <TableCell>
          <Badge 
            variant={user.isActive ? "default" : "secondary"}
            className={user.isActive 
              ? "bg-green-100 text-green-800 hover:bg-green-200" 
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }
            aria-label={`User status: ${user.isActive ? 'Active' : 'Inactive'}`}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>

        {/* ========== GENDER ========== */}
        <TableCell>
          <div className="text-sm text-gray-700">
            {user.gender || 'N/A'}
          </div>
        </TableCell>

        {/* ========== ROLE ========== */}
        <TableCell>
          <Badge variant="outline" className="font-medium">
            {user.role || 'User'}
          </Badge>
        </TableCell>

        {/* ========== DATES ========== */}
        <TableCell>
          <div className="space-y-1">
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              <span>Created: {formatDate(user.createdAt)}</span>
            </div>
            <div className="text-xs text-gray-500">
              Updated: {formatDate(user.updatedAt)}
            </div>
            {user.dob && (
              <div className="text-xs text-gray-500">
                DOB: {formatDate(user.dob)}
              </div>
            )}
          </div>
        </TableCell>

        {/* ========== ACTIONS ========== */}
        <TableCell>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`Delete user ${user.fullName || user.username}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        user={user}
        onRemoveUser={onRemoveUser}
        onAddUser={onAddUser}
      />
    </>
  );
};

export default UserRow;
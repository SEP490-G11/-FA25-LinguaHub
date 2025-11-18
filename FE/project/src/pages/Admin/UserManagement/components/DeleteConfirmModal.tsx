import React from 'react';
import { AlertTriangle, Loader2, User, Mail, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useDeleteUser } from '../hooks/useDeleteUser';
import { User as UserType } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onRemoveUser: (userID: number) => void;
  onAddUser: (user: UserType) => void;
}

/**
 * DeleteConfirmModal component for user deletion confirmation
 * Requirements: 2.1, 2.5 - confirmation dialog with user information, confirmation/cancellation actions, loading state
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  user,
  onRemoveUser,
  onAddUser,
}) => {
  const { deleteUser, isDeleting, error, clearError } = useDeleteUser();
  const { toast } = useToast();

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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      clearError();
      
      await deleteUser(
        user.userID,
        onRemoveUser, // Optimistic update callback
        onAddUser,    // Rollback callback
        user          // User data for rollback
      );
      
      // Show success toast
      toast({
        title: "User deleted successfully",
        description: `${user.fullName || user.username} has been removed from the system.`,
        variant: "success",
      });
      
      // Close modal on successful deletion
      onClose();
    } catch (err) {
      // Show error toast
      toast({
        title: "Failed to delete user",
        description: error || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      // Error is handled by the hook, modal stays open to show error
      console.error('Delete failed:', err);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isDeleting) {
      clearError();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="delete-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Confirm User Deletion
          </DialogTitle>
          <DialogDescription id="delete-description">
            This action cannot be undone. The user will be permanently removed from the system.
          </DialogDescription>
        </DialogHeader>

        {/* ========== USER INFORMATION DISPLAY ========== */}
        <div className="bg-gray-50 rounded-lg p-4 my-4" role="region" aria-label="User information">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-16 w-16 mx-auto sm:mx-0">
              <AvatarImage 
                src={user.avatarURL} 
                alt={`${user.fullName || user.username}'s avatar`}
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-lg">
                {getAvatarFallback(user.fullName, user.username)}
              </AvatarFallback>
            </Avatar>

            {/* User Details */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {user.fullName || 'N/A'}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span>{user.username}</span>
                  </div>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span>ID: {user.userID}</span>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span className="truncate max-w-[200px] sm:max-w-none">{user.email || 'N/A'}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3">
                <Badge 
                  variant={user.isActive ? "default" : "secondary"}
                  className={user.isActive 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                  }
                  aria-label={`User status: ${user.isActive ? 'Active' : 'Inactive'}`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">
                  {user.role || 'User'}
                </Badge>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                <span>Created: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========== ERROR MESSAGE ========== */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium mb-1">
                  Failed to delete user
                </p>
                <p className="text-red-700 text-sm">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="ml-3 text-red-600 border-red-300 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* ========== MODAL ACTIONS ========== */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
            aria-label="Cancel deletion"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-w-[100px] w-full sm:w-auto"
            aria-label={isDeleting ? 'Deleting user, please wait' : `Delete user ${user.fullName || user.username}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
import React from 'react';
import { Users, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { UserTable } from './components/UserTable';
import { useUsers } from './hooks/useUsers';

/**
 * UserManagement main page component
 * Requirements: 1.1, 1.4, 4.1, 4.4 - Set up page layout, loading states, error handling, connect with useUsers hook
 */
export default function UserManagement() {
  const { users, loading, error, refresh, removeUser, addUser } = useUsers();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const activeUsersCount = users.filter(user => user.isActive).length;
  const totalUsersCount = users.length;

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* ========== HEADER SECTION ========== */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-600 text-white py-6 sm:py-10 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
                </div>
                <span>User Management</span>
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">Manage and monitor all users in the system</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
              <p className="text-blue-100 text-xs sm:text-sm font-semibold uppercase tracking-wide">Active Users</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1" aria-label={`${activeUsersCount} active users`}>
                {activeUsersCount}
              </p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
              <p className="text-blue-100 text-xs sm:text-sm font-semibold uppercase tracking-wide">Total Users</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1" aria-label={`${totalUsersCount} total users`}>
                {totalUsersCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* ========== LOADING STATE ========== */}
        {loading ? (
          <div className="flex justify-center items-center py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mb-4">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-600" aria-hidden="true" />
              </div>
              <p className="text-gray-700 font-semibold text-base sm:text-lg">Loading users...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the user data</p>
            </div>
          </div>
        ) : error ? (
          /* ========== ERROR STATE ========== */
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-8 sm:p-16 text-center hover:shadow-lg transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 via-red-100 to-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Error Loading Users</h3>
            <p className="text-gray-600 text-base sm:text-lg mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={isRefreshing ? 'Retrying to load users' : 'Try again to load users'}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </button>
          </div>
        ) : users.length === 0 ? (
          /* ========== EMPTY STATE ========== */
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-8 sm:p-16 text-center hover:shadow-lg transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Users Found</h3>
            <p className="text-gray-600 text-base sm:text-lg">There are currently no users in the system.</p>
          </div>
        ) : (
          /* ========== USER TABLE ========== */
          <UserTable 
            users={users} 
            onRefresh={handleRefresh}
            onRemoveUser={removeUser}
            onAddUser={addUser}
            isRefreshing={isRefreshing}
          />
        )}
      </div>
    </div>
  );
}
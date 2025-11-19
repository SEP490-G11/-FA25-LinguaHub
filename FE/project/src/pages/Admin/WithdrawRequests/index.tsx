import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { withdrawRequestApi } from './api';
import { WithdrawRequest } from './types';
import { 
  calculateStats, 
  filterByStatus, 
  sortByDate 
} from './utils';
import WithdrawRequestStatsComponent from './components/WithdrawRequestStats';
import { Filters } from './components/Filters';
import { WithdrawRequestTable } from './components/WithdrawRequestTable';
import { Pagination } from './components/Pagination';

export default function AdminWithdrawRequestsPage() {
  const navigate = useNavigate();
  
  // State management as per task requirements
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch withdrawal requests from API
  const fetchWithdrawRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await withdrawRequestApi.getAllWithdrawRequests();
      setWithdrawRequests(data);
    } catch (err: any) {
      // Handle 403 errors by displaying permission denied message
      if (err.message.includes('permission')) {
        setError('You do not have permission to view withdrawal requests. Please contact your administrator.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchWithdrawRequests on component mount
  useEffect(() => {
    fetchWithdrawRequests();
  }, []);

  // Client-side filtering logic using filterByStatus utility
  const filteredRequests = filterByStatus(withdrawRequests, selectedStatus);

  // Client-side sorting logic using sortByDate utility
  const sortedRequests = sortByDate(filteredRequests, sortOrder);

  // Client-side pagination calculations
  const totalFiltered = sortedRequests.length;
  const calculatedTotalPages = Math.ceil(totalFiltered / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRequests = sortedRequests.slice(startIndex, endIndex);

  // Update pagination state when filtered data changes
  useEffect(() => {
    setTotal(totalFiltered);
    setTotalPages(calculatedTotalPages);
    // Reset to page 1 if current page exceeds total pages
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalFiltered, calculatedTotalPages, currentPage]);

  // Calculate statistics from all withdrawal requests
  const stats = calculateStats(withdrawRequests);

  // Handler for retry on error
  const handleRetry = () => {
    fetchWithdrawRequests();
  };

  // Handler for page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handler for status filter change
  const handleStatusChange = (status: 'all' | 'PENDING' | 'APPROVED' | 'REJECTED') => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handler for sort order change
  const handleSortOrderChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Handler for approve action
  const handleApprove = async (withdrawId: number) => {
    try {
      // Add withdrawId to processingIds set during API call to disable buttons
      setProcessingIds(prev => new Set(prev).add(withdrawId));
      
      // Clear any previous messages
      setSuccessMessage(null);
      setErrorMessage(null);

      // Call approveWithdrawRequest API
      const response = await withdrawRequestApi.approveWithdrawRequest(withdrawId);
      
      // Update withdrawal request status in state on successful API response
      setWithdrawRequests(prev => 
        prev.map(request => 
          request.withdrawId === withdrawId 
            ? { ...request, status: 'APPROVED' as const }
            : request
        )
      );

      // Display success notification
      setSuccessMessage(response.message || 'Withdrawal request approved successfully');
      
      // Refresh withdrawal requests data after successful approve action
      await fetchWithdrawRequests();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to approve withdrawal request';
      
      // Handle 404 and 409 errors by showing toast notification and refreshing data
      if (errorMsg.includes('not found') || errorMsg.includes('already processed')) {
        setErrorMessage(errorMsg);
        // Refresh data to get the latest state
        await fetchWithdrawRequests();
        // Auto-hide error message after 5 seconds
        setTimeout(() => setErrorMessage(null), 5000);
      } else {
        // Display error notification on API failure with error message
        setErrorMessage(errorMsg);
        // Auto-hide error message after 5 seconds
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } finally {
      // Remove withdrawId from processingIds set after API call completes
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(withdrawId);
        return newSet;
      });
    }
  };

  // Handler for reject action
  const handleReject = async (withdrawId: number) => {
    try {
      // Add withdrawId to processingIds set during API call to disable buttons
      setProcessingIds(prev => new Set(prev).add(withdrawId));
      
      // Clear any previous messages
      setSuccessMessage(null);
      setErrorMessage(null);

      // Call rejectWithdrawRequest API
      const response = await withdrawRequestApi.rejectWithdrawRequest(withdrawId);
      
      // Update withdrawal request status in state on successful API response
      setWithdrawRequests(prev => 
        prev.map(request => 
          request.withdrawId === withdrawId 
            ? { ...request, status: 'REJECTED' as const }
            : request
        )
      );

      // Display success notification
      setSuccessMessage(response.message || 'Withdrawal request rejected successfully');
      
      // Refresh withdrawal requests data after successful reject action
      await fetchWithdrawRequests();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to reject withdrawal request';
      
      // Handle 404 and 409 errors by showing toast notification and refreshing data
      if (errorMsg.includes('not found') || errorMsg.includes('already processed')) {
        setErrorMessage(errorMsg);
        // Refresh data to get the latest state
        await fetchWithdrawRequests();
        // Auto-hide error message after 5 seconds
        setTimeout(() => setErrorMessage(null), 5000);
      } else {
        // Display error notification on API failure with error message
        setErrorMessage(errorMsg);
        // Auto-hide error message after 5 seconds
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } finally {
      // Remove withdrawId from processingIds set after API call completes
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(withdrawId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
          <div className="max-w-[1600px] mx-auto px-6 py-5">
            {/* Page Title and Back Button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(ROUTES.ADMIN_PAYMENTS)}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Payments
                </Button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Withdraw Requests Management</h1>
                  <p className="text-blue-100 text-sm">Manage tutor withdrawal requests</p>
                </div>
              </div>
            </div>

            {/* Statistics Component */}
            <WithdrawRequestStatsComponent stats={stats} isLoading={isLoading} />
          </div>
        </div>

        {/* Filters Bar Section */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Filters
                selectedStatus={selectedStatus}
                onStatusChange={handleStatusChange}
                sortOrder={sortOrder}
                onSortOrderChange={handleSortOrderChange}
              />
              <div className="text-sm text-gray-600">
                Showing {paginatedRequests.length} of {total} requests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Success Notification */}
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="flex items-center justify-between text-green-700">
              <span>{successMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-600 hover:text-green-800"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="ml-4"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Banner */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading withdrawal requests...</p>
            </div>
          </div>
        ) : paginatedRequests.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawal requests</h3>
            <p className="text-gray-500 text-sm">
              {selectedStatus !== 'all' 
                ? `No ${selectedStatus.toLowerCase()} requests found` 
                : 'No withdrawal requests available'}
            </p>
          </div>
        ) : (
          /* Withdrawal Requests Table */
          <>
            <WithdrawRequestTable
              requests={paginatedRequests}
              processingIds={processingIds}
              onApprove={handleApprove}
              onReject={handleReject}
            />

            {/* Pagination Component */}
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={limit}
                isLoading={isLoading}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

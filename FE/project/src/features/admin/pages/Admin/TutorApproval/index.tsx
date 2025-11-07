import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, CheckCircle2, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import ApplicationDetailModal from './components/application-detail-modal';
import { ApplicationList } from './components/application-list';
import { Filters } from './components/filters';
import { Application } from './types';
import * as tutorApi from '@/features/admin/queries/tutor-approval-api';

export default function TutorApproval() {
  // ==========================================================
  // PHASE 3: State Management with React Query
  // ==========================================================
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Query: Fetch applications
  const {
    data: applicationsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tutor-applications', searchQuery, statusFilter],
    queryFn: () =>
      tutorApi.getPendingApplications(1, 100, {
        search: searchQuery,
        status: statusFilter,
      }),
  });

  // Mutation: Approve application
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      tutorApi.approveApplication(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] });
      setSuccessMessage('✅ Application approved successfully!');
      setIsModalOpen(false);
      setSelectedApplication(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to approve application');
      setTimeout(() => setErrorMessage(null), 4000);
    },
  });

  // Mutation: Reject application
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tutorApi.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] });
      setSuccessMessage('✅ Application rejected successfully!');
      setIsModalOpen(false);
      setSelectedApplication(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to reject application');
      setTimeout(() => setErrorMessage(null), 4000);
    },
  });

  // ==========================================================
  // PHASE 4: Handle Different States
  // ==========================================================
  const applications = applicationsData?.data || [];
  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const totalCount = applications.length;

  const handleViewDetail = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleApprove = (applicationId: string, adminNotes?: string) => {
    approveMutation.mutate({ id: applicationId, notes: adminNotes });
  };

  const handleReject = (applicationId: string, rejectionReason: string) => {
    rejectMutation.mutate({ id: applicationId, reason: rejectionReason });
  };

  // ==========================================================
  // PHASE 4: Render Different States
  // ==========================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* ========== HEADER SECTION ========== */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-600 text-white py-10 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-2 flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Users className="w-8 h-8" />
                </div>
                Tutor Application Management
              </h1>
              <p className="text-blue-100 text-lg">Review and approve learner applications to become tutors</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Pending Review</p>
              <p className="text-4xl font-bold text-white mt-1">{pendingCount}</p>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Applications</p>
              <p className="text-4xl font-bold text-white mt-1">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ========== Success Message ========== */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top shadow-md">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* ========== Error Message ========== */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 justify-between animate-in fade-in slide-in-from-top shadow-sm">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========== FILTER SECTION ========== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-8 mb-8 hover:shadow-lg transition-all">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Filter className="w-6 h-6 text-indigo-600" />
            Search & Filter Applications
          </h2>
          <Filters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
          <div className="mt-6 flex gap-2">
            <Button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 font-semibold"
            >
              ↻ Reset Filters
            </Button>
          </div>
        </div>

        {/* ========== APPLICATION LIST SECTION ========== */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Loading applications...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the applications</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md border border-red-100 p-16 text-center hover:shadow-lg transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 via-red-100 to-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Applications</h3>
            <p className="text-gray-600 text-lg">{(error as Error).message}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-16 text-center hover:shadow-lg transition-all">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-indigo-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Applications Found</h3>
            <p className="text-gray-600 text-lg">
              {searchQuery || statusFilter
                ? 'Try adjusting your search or filter criteria'
                : 'All applications have been reviewed!'}
            </p>
          </div>
        ) : (
          <ApplicationList
            applications={applications}
            onViewDetails={handleViewDetail}
          />
        )}
      </div>

      {/* ========== Detail Modal ========== */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveMutation.isPending || rejectMutation.isPending}
        />
      )}
    </div>
  );
}

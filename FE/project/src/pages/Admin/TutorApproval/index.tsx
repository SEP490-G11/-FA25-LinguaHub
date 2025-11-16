import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Users, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicationList } from './components/application-list';
import { Filters } from './components/filters';
import { Application } from './types';
import { tutorApprovalApi as tutorApi } from './api';

export default function TutorApproval() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const applications = applicationsData?.data || [];
  const pendingCount = applications.filter((app) => app.status === 'pending').length;
  const totalCount = applications.length;

  const handleViewDetail = (application: Application) => {
    // Navigate to detail page instead of opening modal
    navigate(`/admin/tutor-approval/${application.id}`);
  };

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
    </div>
  );
}

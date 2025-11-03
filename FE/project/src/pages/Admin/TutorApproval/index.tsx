import { useState, useMemo } from 'react';
import { Filter, CheckCircle2, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApplicationDetailModal from './components/application-detail-modal';
import { ApplicationList } from './components/application-list';
import { Filters } from './components/filters';
import { Application } from './types';

const mockApplications: Application[] = [
  {
    id: '1',
    applicantName: 'Nguyễn Văn A',
    applicantEmail: 'nguyenvana@email.com',
    teachingLanguages: ['English', 'Vietnamese'],
    specialization: 'Business English',
    experience: 5,
    bio: 'I have been teaching English for 5 years with a focus on business communication. I hold a TESOL certificate and have worked with students from various countries.',
    certificateName: 'TESOL Certificate',
    certificateUrl: 'https://example.com/cert1.pdf',
    status: 'pending',
    appliedDate: '2025-10-28',
  },
  {
    id: '2',
    applicantName: 'Trần Thị B',
    applicantEmail: 'tranthib@email.com',
    teachingLanguages: ['Korean', 'Vietnamese'],
    specialization: 'Conversational Korean',
    experience: 3,
    bio: 'Native Korean speaker with 3 years of teaching experience. I specialize in helping students improve their conversational skills through interactive lessons.',
    certificateName: 'Korean Language Teaching Certificate',
    certificateUrl: 'https://example.com/cert2.pdf',
    status: 'pending',
    appliedDate: '2025-10-27',
  },
  {
    id: '3',
    applicantName: 'Lê Minh C',
    applicantEmail: 'leminhc@email.com',
    teachingLanguages: ['Japanese', 'Vietnamese', 'English'],
    specialization: 'JLPT Preparation',
    experience: 7,
    bio: 'Experienced Japanese language teacher with JLPT N1 certification. I have helped over 100 students pass their JLPT exams with high scores.',
    certificateName: 'JLPT N1 Certificate',
    certificateUrl: 'https://example.com/cert3.pdf',
    status: 'approved',
    appliedDate: '2025-10-25',
  },
  {
    id: '4',
    applicantName: 'Phạm Thị D',
    applicantEmail: 'phamthid@email.com',
    teachingLanguages: ['French', 'Vietnamese'],
    specialization: 'French for Beginners',
    experience: 4,
    bio: 'French literature graduate with 4 years of teaching experience. I focus on making French learning fun and accessible for beginners.',
    certificateName: 'DELF B2 Certificate',
    certificateUrl: 'https://example.com/cert4.pdf',
    status: 'pending',
    appliedDate: '2025-10-26',
  },
  {
    id: '5',
    applicantName: 'Hoàng Văn E',
    applicantEmail: 'hoangvane@email.com',
    teachingLanguages: ['Chinese', 'Vietnamese'],
    specialization: 'HSK Preparation',
    experience: 2,
    bio: 'Recent graduate with HSK 6 certification. I am passionate about teaching Chinese and helping students prepare for HSK exams.',
    certificateName: 'HSK 6 Certificate',
    certificateUrl: 'https://example.com/cert5.pdf',
    status: 'rejected',
    appliedDate: '2025-10-24',
  },
  {
    id: '6',
    applicantName: 'Vũ Thị F',
    applicantEmail: 'vuthif@email.com',
    teachingLanguages: ['Spanish', 'English', 'Vietnamese'],
    specialization: 'Spanish Grammar and Conversation',
    experience: 6,
    bio: 'Certified Spanish teacher with 6 years of international teaching experience. I specialize in grammar and conversational Spanish for all levels.',
    certificateName: 'DELE C1 Certificate',
    certificateUrl: 'https://example.com/cert6.pdf',
    status: 'pending',
    appliedDate: '2025-10-29',
  },
];

export default function TutorApproval() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading] = useState(false);

  const filteredApplications = useMemo(() => {
    return mockApplications.filter((app) => {
      const matchesSearch =
        searchQuery === '' ||
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.teachingLanguages.some((lang) =>
          lang.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        !statusFilter || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleViewDetail = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const pendingCount = mockApplications.filter(app => app.status === 'pending').length;

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
              <p className="text-4xl font-bold text-white mt-1">{mockApplications.length}</p>
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
        ) : filteredApplications.length === 0 ? (
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
            applications={filteredApplications}
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
        />
      )}
    </div>
  );
}

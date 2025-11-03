import { useState, useMemo } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, User, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ApplicationDetailModal from './components/application-detail-modal';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        statusFilter === 'all' || app.status === statusFilter;

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

  const getStatusBadge = (status: Application['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Tutor Application Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Review and approve learner applications to become tutors
          </p>
        </div>

        <Card className="mb-6 shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl">Filters</CardTitle>
            <CardDescription>Search and filter applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Applications</CardTitle>
                <CardDescription>
                  Manage tutor applications from learners
                </CardDescription>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold">{filteredApplications.length}</span> application(s)
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-lg">No applications found</p>
                <p className="text-sm mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Applicant</TableHead>
                      <TableHead>Languages</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead className="text-center">Experience</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Applied Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-slate-900 dark:text-slate-50">
                              {application.applicantName}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {application.applicantEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {application.teachingLanguages.map((lang, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                              >
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {application.specialization}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm font-medium">
                            {application.experience} years
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(application.appliedDate).toLocaleDateString('vi-VN')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(application)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Languages,
  Briefcase,
  Award,
  FileText,
  ExternalLink,
  Calendar,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Phone,
  Globe,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tutorApprovalApi } from './api';
import { Application } from './types';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch application detail
  const {
    data: application,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tutor-application', id],
    queryFn: () => tutorApprovalApi.getApplicationById(id!),
    enabled: !!id,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => tutorApprovalApi.approveApplication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-application', id] });
      setSuccessMessage('✅ Application approved successfully!');
      setTimeout(() => {
        navigate('/admin/tutor-approval');
      }, 2000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to approve application');
      setTimeout(() => setErrorMessage(null), 4000);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => tutorApprovalApi.rejectApplication(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutor-applications'] });
      queryClient.invalidateQueries({ queryKey: ['tutor-application', id] });
      setSuccessMessage('✅ Application rejected successfully!');
      setTimeout(() => {
        navigate('/admin/tutor-approval');
      }, 2000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to reject application');
      setTimeout(() => setErrorMessage(null), 4000);
    },
  });

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this application?')) {
      approveMutation.mutate();
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide a reason for rejection');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    if (window.confirm('Are you sure you want to reject this application?')) {
      rejectMutation.mutate(rejectionReason);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
      <Badge className={`${variants[status]} text-sm px-3 py-1 border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Application</h3>
              <p className="text-gray-600 mb-4">
                {(error as Error)?.message || 'Application not found'}
              </p>
              <Button onClick={() => navigate('/admin/tutor-approval')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-600 text-white py-8 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/tutor-approval')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Application Details</h1>
              <p className="text-blue-100 text-lg">Review tutor application information</p>
            </div>
            {getStatusBadge(application.status)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top shadow-md">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 justify-between animate-in fade-in slide-in-from-top shadow-sm">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="flex-shrink-0 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Information */}
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center text-indigo-900">
                  <User className="w-5 h-5 mr-2" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Full Name</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.applicantName}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.applicantEmail}
                    </p>
                  </div>

                  {application.userPhone && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Phone</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {application.userPhone}
                      </p>
                    </div>
                  )}

                  {application.country && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Country</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {application.country}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Applied Date</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(application.appliedDate)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {application.experience} years
                    </p>
                  </div>

                  {application.pricePerHour && application.pricePerHour > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Price Per Hour</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        ${application.pricePerHour}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teaching Information */}
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center text-indigo-900">
                  <Languages className="w-5 h-5 mr-2" />
                  Teaching Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center">
                    <Languages className="h-4 w-4 mr-2" />
                    Teaching Languages
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {application.teachingLanguages.map((lang, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Specialization
                  </Label>
                  <p className="text-base text-gray-900 font-medium">
                    {application.specialization}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm text-gray-600 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Bio
                  </Label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {application.bio}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            {application.certificates && application.certificates.length > 0 && (
              <Card className="shadow-lg border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center text-indigo-900">
                    <Award className="w-5 h-5 mr-2" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {application.certificates.map((cert, index) => (
                      <div
                        key={cert.certificateId}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-2">
                              {cert.certificateName}
                            </p>
                            <a
                              href={cert.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                            >
                              View Certificate
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Panel - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {application.status === 'pending' && (
                <Card className="shadow-lg border-indigo-200">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <CardTitle className="text-lg">Review Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {!showRejectForm ? (
                      <>
                        <Button
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
                        >
                          {approveMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Approve Application
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => setShowRejectForm(true)}
                          disabled={isProcessing}
                          variant="destructive"
                          className="w-full font-semibold py-6 text-lg"
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Reject Application
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="rejectionReason" className="text-red-700 font-semibold">
                            Rejection Reason *
                          </Label>
                          <Textarea
                            id="rejectionReason"
                            placeholder="Please provide a detailed reason for rejection..."
                            rows={6}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="resize-none border-red-300 focus:border-red-500 focus:ring-red-500"
                            disabled={isProcessing}
                          />
                          <p className="text-xs text-gray-600">
                            This reason will be sent to the applicant
                          </p>
                        </div>

                        <Button
                          onClick={handleReject}
                          disabled={isProcessing || !rejectionReason.trim()}
                          variant="destructive"
                          className="w-full font-semibold py-6"
                        >
                          {rejectMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 mr-2" />
                              Confirm Rejection
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason('');
                          }}
                          disabled={isProcessing}
                          variant="outline"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {application.status !== 'pending' && (
                <Card className="shadow-lg border-gray-200">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg">Application Status</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-center py-4">
                      {getStatusBadge(application.status)}
                      <p className="text-sm text-gray-600 mt-4">
                        This application has been {application.status}
                      </p>
                      {application.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Reviewed on {formatDate(application.reviewedAt)}
                        </p>
                      )}
                      {application.reviewedBy && (
                        <p className="text-xs text-gray-500">
                          By: {application.reviewedBy}
                        </p>
                      )}
                      {application.reasonForReject && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                          <p className="text-xs font-semibold text-red-700 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-900">
                            {application.reasonForReject}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Application Info */}
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg">Application Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Application ID:</span>
                    <span className="font-semibold text-gray-900">#{application.verificationId}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">User ID:</span>
                    <span className="font-semibold text-gray-900">#{application.userId}</span>
                  </div>
                  {application.tutorId && application.tutorId > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tutor ID:</span>
                        <span className="font-semibold text-gray-900">#{application.tutorId}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { GraduationCap, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { TutorApplicationForm } from './components/application-form';
import { ApplicationStatusDisplay } from './components/application-status';
import { TutorApplicationFormData } from './types';
import { tutorApplicationAPI } from '@/features/learner/queries/tutor-application-api';

// ==========================================================
// Phase 1: Main Apply Tutor Page Component
// ==========================================================

export default function ApplyTutorPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  // Get current user ID (replace with actual auth context)
  // TODO: Replace with actual authentication
  const currentUserId = '1'; // Placeholder

  // ==========================================================
  // Phase 3: React Query Integration
  // ==========================================================

  // Query to check existing application
  const {
    data: existingApplication,
    isLoading: isCheckingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ['tutor-application', currentUserId],
    queryFn: () => tutorApplicationAPI.getApplicationStatus(currentUserId),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for submitting application
  const submitMutation = useMutation({
    mutationFn: (data: TutorApplicationFormData) =>
      tutorApplicationAPI.submitApplication(currentUserId, data),
    onSuccess: () => {
      setShowSuccess(true);
      // Refetch status to get updated data
      refetchStatus();
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // ==========================================================
  // Phase 4: Different States Handling
  // ==========================================================

  // Loading state
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking application status...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state (no application found)
  const hasNoApplication = statusError || !existingApplication;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {hasNoApplication ? 'Become a Tutor' : 'Your Application Status'}
          </h1>
          <p className="text-lg text-gray-600">
            {hasNoApplication
              ? 'Share your expertise and teach students around the world'
              : 'View your tutor application details and status'}
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Application submitted successfully!</strong> Our admin team will
              review your application within 3-5 business days.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {hasNoApplication ? (
          // Show application form
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <TutorApplicationForm
                onSubmit={(data) => submitMutation.mutate(data)}
                isSubmitting={submitMutation.isPending}
                error={
                  submitMutation.error
                    ? submitMutation.error instanceof Error
                      ? submitMutation.error.message
                      : 'Failed to submit application'
                    : null
                }
              />
            </CardContent>
          </Card>
        ) : (
          // Show application status
          <div className="space-y-6">
            <ApplicationStatusDisplay application={existingApplication} />

            {/* Action Buttons */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {/* Help Section */}
        {hasNoApplication && (
          <Card className="mt-8 border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Application Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    <strong>Teaching Languages:</strong> Select at least one language you
                    can teach
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    <strong>Specialization:</strong> Describe your area of expertise (3-255
                    characters)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    <strong>Experience:</strong> Provide your years of teaching experience
                    (0-50 years)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    <strong>Bio:</strong> Write a compelling professional bio (50-1000
                    characters)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    <strong>Certificate:</strong> Provide valid teaching certificate with
                    accessible URL
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

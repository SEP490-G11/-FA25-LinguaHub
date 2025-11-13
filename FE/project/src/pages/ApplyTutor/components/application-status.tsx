import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  Languages,
  Award,
  Briefcase,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ApplicationStatus } from '../types';

interface ApplicationStatusProps {
  application: ApplicationStatus;
}

// ==========================================================
// Phase 1.3: Status Display Component
// ==========================================================

export function ApplicationStatusDisplay({ application }: ApplicationStatusProps) {
  // Determine status styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          variant: 'default' as const,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          title: 'Application Under Review',
          description: 'Your tutor application is being reviewed by our admin team. We will notify you once a decision is made.',
        };
      case 'Approved':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          variant: 'default' as const,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          title: 'Application Approved! 🎉',
          description: 'Congratulations! Your tutor application has been approved. You can now start creating courses and teaching students.',
        };
      case 'Rejected':
        return {
          icon: <XCircle className="w-5 h-5" />,
          variant: 'destructive' as const,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          title: 'Application Not Approved',
          description: application.reasonForReject || 'Unfortunately, your application did not meet our requirements at this time. Please review the feedback below.',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          variant: 'default' as const,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          title: 'Application Status',
          description: 'Your application status is being processed.',
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      <Alert className={`${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <div className="flex items-start gap-3">
          <div className={statusConfig.textColor}>{statusConfig.icon}</div>
          <div className="flex-1">
            <AlertTitle className={`text-lg font-semibold ${statusConfig.textColor}`}>
              {statusConfig.title}
            </AlertTitle>
            <AlertDescription className="mt-2 text-sm">
              {statusConfig.description}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Details</CardTitle>
            <Badge
              variant={statusConfig.variant}
              className={`${statusConfig.textColor} ${statusConfig.bgColor}`}
            >
              {application.status}
            </Badge>
          </div>
          <CardDescription>
            Submitted on {new Date(application.submittedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teaching Languages */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Languages className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Teaching Languages
              </p>
              <div className="flex flex-wrap gap-2">
                {application.teachingLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="bg-white">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Specialization */}
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <Award className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Specialization
              </p>
              <p className="text-sm text-gray-600">{application.specialization}</p>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Teaching Experience
              </p>
              <p className="text-sm text-gray-600">
                {application.experience} {application.experience === 1 ? 'year' : 'years'}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Professional Bio
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {application.bio}
              </p>
            </div>
          </div>

          {/* Certificate */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
            <ExternalLink className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Teaching Certificate
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {application.certificateName}
              </p>
              <a
                href={application.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-800 underline inline-flex items-center gap-1"
              >
                View Certificate
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Review Date */}
          {application.reviewedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
              <Calendar className="w-4 h-4" />
              <span>
                Reviewed on {new Date(application.reviewedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}

          {/* Admin Comment */}
          {application.reasonForReject && application.status === 'Rejected' && (
            <Alert variant="destructive" className="mt-4">
              <User className="h-4 w-4" />
              <AlertTitle>Feedback from Admin</AlertTitle>
              <AlertDescription className="mt-2">
                {application.reasonForReject}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      {application.status === 'Pending' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>What happens next?</AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            <p>• Our admin team will review your application within 3-5 business days</p>
            <p>• You will receive an email notification once your application is reviewed</p>
            <p>• If approved, you can immediately start creating courses</p>
          </AlertDescription>
        </Alert>
      )}

      {application.status === 'Approved' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Ready to Start Teaching!</AlertTitle>
          <AlertDescription className="mt-2 text-green-600">
            You can now access the tutor dashboard and start creating your first course.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

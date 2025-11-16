import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatusResponse } from '../types';
import * as date from 'date-and-time';

interface ApplicationStatusProps {
  data: ApplicationStatusResponse;
}

export function ApplicationStatus({ data }: ApplicationStatusProps) {
  const { status, submittedAt, reasonForReject } = data;

  // Format the submission date
  const formattedDate = date.format(new Date(submittedAt), 'MMM DD, YYYY');

  // Determine badge variant and color based on status
  const getBadgeVariant = () => {
    switch (status) {
      case 'APPROVED':
        return 'default'; // Green/primary color
      case 'REJECTED':
        return 'destructive'; // Red color
      case 'PENDING':
      default:
        return 'secondary'; // Gray/secondary color
    }
  };

  // Get status message based on status
  const getStatusMessage = () => {
    switch (status) {
      case 'APPROVED':
        return 'Congratulations! Your application has been approved. You can now create and teach courses on the platform.';
      case 'REJECTED':
        return 'Unfortunately, your application has been rejected.';
      case 'PENDING':
      default:
        return 'Your application is currently under review. We will notify you once a decision has been made.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Badge variant={getBadgeVariant()}>
              {status}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Submitted:</span>
            <span className="text-sm">{formattedDate}</span>
          </div>

          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              {getStatusMessage()}
            </p>
          </div>

          {status === 'REJECTED' && reasonForReject && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Reason for rejection:</p>
              <p className="text-sm text-destructive">{reasonForReject}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

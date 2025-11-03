export interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  teachingLanguages: string[];
  specialization: string;
  experience: number;
  bio: string;
  certificateName: string;
  certificateUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
}

export interface ApprovalFormData {
  status: 'approved' | 'rejected';
  adminNotes?: string;
}

// Unified types for Course Approval
// These types match the structure from TutorPages for consistency

export type CourseStatus = 'Pending' | 'Approved' | 'Rejected' | 'Draft';

export interface Objective {
  objectiveID: number;
  objectiveText: string;
  orderIndex: number;
}

export interface Resource {
  resourceID: number;
  resourceType: 'PDF' | 'ExternalLink';
  resourceTitle: string;
  resourceURL: string;
}

export interface Lesson {
  lessonID: number;
  title: string;
  duration: number;
  lessonType: 'Video' | 'Reading';
  videoURL?: string;
  content?: string;
  orderIndex: number;
  resources: Resource[];
}

export interface Section {
  sectionID: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface PendingCourse {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  requirement: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryID: number;
  categoryName?: string;
  language: string;
  duration: number;
  price: number;
  thumbnailURL: string;
  status: CourseStatus;
  tutorID: number;
  tutorName?: string;
  tutorEmail?: string;
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean; // true if this is a draft, false if live course
}

export interface CourseDetail extends PendingCourse {
  section: Section[];
  objectives: Objective[];
  adminNotes?: string;
  rejectionReason?: string;
  isDraft?: boolean;
}

export interface ApprovalFilters {
  search?: string;
  categoryID?: number;
  status?: CourseStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

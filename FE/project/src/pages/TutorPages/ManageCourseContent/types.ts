// TypeScript interfaces for Manage Course Content
// Matches database schema: CourseSection, Lessons, LessonResource

export interface LessonResourceData {
  ResourceID?: number;
  LessonID?: number;
  ResourceType: 'PDF' | 'ExternalLink';
  ResourceTitle: string;
  ResourceURL: string;
  CreatedAt?: string;
}

export interface LessonData {
  LessonID?: number;
  SectionID?: number;
  Title: string;
  Duration: number; // in minutes
  LessonType: 'Video' | 'Reading';
  VideoURL?: string;
  Content?: string; // For Reading type lessons
  OrderIndex: number;
  CreatedAt?: string;
  Resources?: LessonResourceData[];
}

export interface SectionData {
  SectionID?: number;
  CourseID?: number;
  Title: string;
  Description?: string;
  OrderIndex: number;
  CreatedAt?: string;
  Lessons?: LessonData[];
}

export interface CourseContentData {
  CourseID: number;
  Title: string;
  Description?: string;
  CategoryID?: string;
  Languages?: string[];
  Duration?: number;
  Price?: number;
  ThumbnailURL?: string;
  Status?: string;
  Sections: SectionData[];
}

// Form interfaces for modals
export interface AddSectionFormData {
  Title: string;
  Description?: string;
}

export interface AddLessonFormData {
  Title: string;
  Duration: number;
  LessonType: 'Video' | 'Reading';
  VideoURL?: string;
  Content?: string;
}

export interface EditSectionFormData extends AddSectionFormData {
  SectionID: number;
}

export interface EditLessonFormData extends AddLessonFormData {
  LessonID: number;
  Resources?: LessonResourceData[];
}

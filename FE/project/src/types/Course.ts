export interface CourseCategory {
    CategoryID: number;
    Name: string;
    Description?: string;
    CreatedAt: string;
}

export interface Course {
    CourseID: number;
    Title: string;
    Description?: string;
    TutorID?: number;
    Duration?: number;
    Price?: number;
    CategoryID?: number;
    Language?: string;
    ThumbnailURL?: string;
    Status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Disabled';
    CreatedAt: string;
    UpdatedAt: string;
    sections?: CourseSection[];
}

export interface CourseSection {
    SectionID: number;
    CourseID: number;
    Title?: string;
    Description?: string;
    OrderIndex?: number;
    lessons?: Lesson[];
}

export interface Lesson {
    LessonID: number;
    SectionID: number;
    Title: string;
    Duration?: number;
    LessonType: 'Video' | 'Reading';
    VideoURL?: string;
    Content?: string;
    OrderIndex?: number;
    CreatedAt: string;
    resources?: LessonResource[];
}

export interface LessonResource {
    ResourceID: number;
    LessonID: number;
    ResourceType: 'PDF' | 'ExternalLink';
    ResourceTitle?: string;
    ResourceURL: string;
    UploadedAt: string;
}

export interface Enrollment {
    EnrollmentID: number;
    UserID: string;
    CourseID: number;
    Status: 'Active' | 'Completed' | 'Cancelled';
    CreatedAt: string;
}

export interface UserCourseSection {
    UserCourseSectionID: number;
    UserID: string;
    EnrollmentID: number;
    SectionID: number;
    Progress: number;
}

export interface UserLesson {
    UserLessonID: number;
    LessonID?: number;
    UserID: string;
    EnrollmentID?: number;
    IsDone: boolean;
    WatchedDuration?: number;
    CompletedAt?: string;
}

export interface CourseReview {
    ReviewID: number;
    CourseID: number;
    UserID: string;
    Rating: number;
    Comment?: string;
    CreatedAt: string;
}
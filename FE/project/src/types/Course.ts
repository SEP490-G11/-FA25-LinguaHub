export interface CourseCategory {
    CategoryID: number;
    Name: string;
    Description?: string;
    CreatedAt: string;
}
export interface Course {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
    language: string;
    thumbnailURL: string;
    categoryName: string;
    tutorName: string;
    status: string;
}

export interface LessonResource {
    ResourceID: number;
    LessonID: number;
    ResourceType: 'PDF' | 'ExternalLink';
    ResourceTitle?: string;
    ResourceURL: string;
    UploadedAt: string;
}
export interface CourseDetail {
    id: number;
    title: string;
    description: string;
    duration: number;
    price: number;
    language: string;
    thumbnailURL: string;
    categoryName: string;
    tutorName: string;
    status: string;
    section: CourseSection[];
}


export interface CourseSection {
    sectionID: number;
    courseID: number;
    title: string;
    description: string;
    orderIndex: number;
    lessons: Lesson[];
}

export interface Lesson {
    lessonID: number;
    title: string;
    duration: number;
    lessonType: "Video" | "Reading";
    videoURL: string | null;
    content: string;
    orderIndex: number;
    createdAt: string;
    resources: LessonResource[];
}

export interface LessonResource {
    resourceID: number;
    resourceType: "PDF" | "ExternalLink";
    resourceTitle: string;
    resourceURL: string;
    uploadedAt: string;
}

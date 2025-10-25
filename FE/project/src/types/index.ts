// Types generated/updated based on LinguaHub DB Schema (v4 - UUID Edition)
// Maps SQL tables to TS interfaces for FE type safety
// Assumptions:
// - IDs: BIGINT → number; CHAR(36) → string (UUID).
// - Dates: DATETIME → string (ISO).
// - Enums: Direct map to union types.
// - Optional: NULLABLE → ?.
// - Nested: Use IDs (fetch separately); add nested arrays for convenience where logical.
// - UUID: UserID, ReviewedBy, etc. as string.

// import { ApiResponse, PaginatedResponse } from './api';  // Assume from previous

// ==========================================================
// 1. CORE USER TYPES
// ==========================================================

export interface User {
  UserID: string;  // CHAR(36) PRIMARY KEY (UUID)
  Email: string;   // VARCHAR UNIQUE NOT NULL
  PasswordHash: string;  // VARCHAR NOT NULL (never expose in FE)
  Role: 'Admin' | 'Tutor' | 'Learner';  // ENUM DEFAULT 'Learner'
  FullName?: string;  // VARCHAR
  AvatarURL?: string;  // VARCHAR
  Gender?: 'Male' | 'Female' | 'Other';  // ENUM
  DOB?: string;  // DATE (ISO string)
  Phone?: string;  // VARCHAR
  Country?: string;  // VARCHAR
  Address?: string;  // VARCHAR
  Bio?: string;  // TEXT
  IsActive: boolean;  // BOOLEAN DEFAULT TRUE
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
  UpdatedAt: string;  // DATETIME ON UPDATE
}

export interface Verification {
  VerificationID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36)
  Type: 'Email' | 'Phone' | 'OTP';  // ENUM
  Code: string;  // VARCHAR(20) NOT NULL
  ExpiredAt?: string;  // DATETIME
  IsVerified: boolean;  // DEFAULT FALSE
}

// ==========================================================
// 2. TUTOR TYPES
// ==========================================================

export interface Tutor {
  TutorID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;   // CHAR(36) UNIQUE
  Experience: number;  // SMALLINT DEFAULT 0
  Specialization?: string;  // VARCHAR
  TeachingLanguage?: string;  // VARCHAR(100) - NEW
  Bio?: string;  // TEXT - NEW
  Rating: number;  // DECIMAL(3,2) DEFAULT 0.0
  Status: 'Pending' | 'Approved' | 'Suspended';  // ENUM DEFAULT 'Pending'
}

export interface TutorVerification {
  TutorVerificationID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36) NOT NULL - CHANGED from TutorID
  Experience: number;  // SMALLINT DEFAULT 0 - NEW
  Specialization?: string;  // VARCHAR - NEW
  TeachingLanguage?: string;  // VARCHAR(100) - NEW
  Bio?: string;  // TEXT - NEW
  CertificateName?: string;  // VARCHAR(255) - NEW
  DocumentURL?: string;  // VARCHAR(255)
  Status: 'Pending' | 'Approved' | 'Rejected';  // ENUM DEFAULT 'Pending'
  SubmittedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP - NEW
  ReviewedBy?: string;  // CHAR(36) NULL - CHANGED to string (UUID)
  ReviewedAt?: string;  // DATETIME NULL
  ReasonForReject?: string;  // TEXT NULL - NEW
}

// ==========================================================
// 3. COURSE & LESSON TYPES
// ==========================================================

export interface CourseCategory {
  CategoryID: number;  // BIGINT AUTO_INCREMENT
  Name: string;  // NOT NULL
  Description?: string;  // TEXT
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
}

export interface Course {
  CourseID: number;  // BIGINT AUTO_INCREMENT
  Title: string;  // NOT NULL
  Description?: string;  // TEXT
  TutorID?: number;  // BIGINT (links to Tutor)
  Duration?: number;  // INT
  Price?: number;  // DECIMAL(10,2) DEFAULT 0.00
  CategoryID?: number;  // BIGINT
  Language?: string;  // VARCHAR DEFAULT 'English'
  ThumbnailURL?: string;  // VARCHAR
  Status: 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Disabled';  // ENUM DEFAULT 'Draft'
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
  UpdatedAt: string;  // DATETIME ON UPDATE
  sections?: CourseSection[];  // Nested for FE (from CourseSection)
}

export interface CourseSection {
  SectionID: number;  // BIGINT AUTO_INCREMENT
  CourseID: number;  // NOT NULL
  Title?: string;  // VARCHAR
  Description?: string;  // TEXT
  OrderIndex?: number;  // INT
  lessons?: Lesson[];  // Nested
}

export interface Lesson {
  LessonID: number;  // BIGINT AUTO_INCREMENT
  SectionID: number;  // NOT NULL
  Title: string;  // NOT NULL
  Duration?: number;  // SMALLINT
  LessonType: 'Video' | 'Reading';  // ENUM DEFAULT 'Video' - NEW
  VideoURL?: string;  // VARCHAR
  Content?: string;  // TEXT - NEW
  OrderIndex?: number;  // INT - NEW
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP - NEW
  resources?: LessonResource[];  // Nested - NEW
}

export interface LessonResource {
  ResourceID: number;  // BIGINT AUTO_INCREMENT
  LessonID: number;  // NOT NULL
  ResourceType: 'PDF' | 'ExternalLink';  // ENUM DEFAULT 'PDF' - NEW
  ResourceTitle?: string;  // VARCHAR
  ResourceURL: string;  // NOT NULL
  UploadedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
}

export interface Enrollment {
  EnrollmentID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36) NOT NULL - CHANGED to string
  CourseID: number;  // NOT NULL
  Status: 'Active' | 'Completed' | 'Cancelled';  // ENUM DEFAULT 'Active'
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
}

export interface UserCourseSection {
  UserCourseSectionID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36) NOT NULL - CHANGED
  EnrollmentID: number;  // NOT NULL
  SectionID: number;  // NOT NULL
  Progress: number;  // DECIMAL(5,2) DEFAULT 0.0
}

export interface UserLesson {
  UserLessonID: number;  // BIGINT AUTO_INCREMENT
  LessonID?: number;
  UserID: string;  // CHANGED to string
  EnrollmentID?: number;
  IsDone: boolean;  // DEFAULT FALSE
  WatchedDuration?: number;  // INT DEFAULT 0
  CompletedAt?: string;
}

export interface CourseReview {
  ReviewID: number;  // BIGINT AUTO_INCREMENT
  CourseID: number;  // NOT NULL
  UserID: string;  // CHAR(36) NOT NULL - CHANGED
  Rating: number;  // INT 1-5
  Comment?: string;  // TEXT
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
}

// ==========================================================
// 4. SERVICES & BENEFITS
// ==========================================================

export interface Service {
  ServiceID: number;  // BIGINT AUTO_INCREMENT
  Title?: string;  // VARCHAR
  Duration?: number;  // INT
  Description?: string;  // TEXT
  Price?: number;  // DECIMAL(10,2) DEFAULT 0.00
}

export interface ServiceBenefit {
  BenefitID: number;  // BIGINT AUTO_INCREMENT
  Title?: string;  // VARCHAR
  Description?: string;  // TEXT
  NumberUsage?: number;  // INT DEFAULT 0
  ServiceID?: number;  // BIGINT
}

export interface UserService {
  UserServiceID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36) - CHANGED
  ServiceID?: number;  // BIGINT
  StartDate?: string;  // DATETIME
  IsActive: boolean;  // DEFAULT TRUE
  Title?: string;  // VARCHAR
  Duration?: number;  // INT
}

export interface UserServiceBenefit {
  UserServiceBenefitID: number;  // BIGINT AUTO_INCREMENT
  UserServiceID: number;
  Title?: string;  // VARCHAR
  Description?: string;  // TEXT
  NumberUsageRemaining?: number;  // INT DEFAULT 0
  NumberBooking?: number;  // INT DEFAULT 0
}

// ==========================================================
// 5. BOOKING & PAYMENT
// ==========================================================

export interface Schedule {
  ScheduleID: number;  // BIGINT AUTO_INCREMENT
  TutorID: number;  // NOT NULL
  StartTime: string;  // DATETIME
  EndTime: string;  // DATETIME
  IsAvailable: boolean;  // DEFAULT TRUE
}

export interface Booking {
  BookingID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36) - CHANGED
  TutorID: number;  // BIGINT
  ScheduleID: number;  // BIGINT
  UserServiceID?: number;  // BIGINT
  Status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';  // ENUM DEFAULT 'Pending'
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
  UpdatedAt: string;  // DATETIME ON UPDATE
}

export interface Payment {
  PaymentID: number;  // BIGINT AUTO_INCREMENT
  Amount?: number;  // DECIMAL(10,2)
  PaymentType: 'Course' | 'Service';  // ENUM
  PaymentMethod: 'PAYOS' | 'VNPAY' | 'BANK';  // ENUM
  EnrollmentID?: number;  // BIGINT NULL (mutually exclusive with UserServiceID)
  UserServiceID?: number;  // BIGINT NULL
  IsPaid: boolean;  // DEFAULT FALSE
  IsRefund: boolean;  // DEFAULT FALSE
  ReceivedID?: string;  // CHAR(36) NULL - CHANGED to string (UUID)
  AmountPaid?: number;  // DECIMAL(10,2) DEFAULT 0.00
  // Note: CHECK constraint handled in SQL; in TS, ensure logic in forms
}

export interface Feedback {
  FeedbackID: number;  // BIGINT AUTO_INCREMENT
  UserID: string;  // CHAR(36) - CHANGED
  PaymentID: number;  // BIGINT
  Rating: number;  // INT 1-5
  Comment?: string;  // TEXT
}

// ==========================================================
// 6. CHAT & POLICY
// ==========================================================

export interface ChatRoom {
  ChatRoomID: number;  // BIGINT AUTO_INCREMENT
  Title?: string;  // VARCHAR
  Description?: string;  // TEXT
  UserID: string;  // CHAR(36) - CHANGED
  TutorID?: number;  // BIGINT
  ChatRoomType: 'Advice' | 'Training';  // ENUM DEFAULT 'Training'
}

export interface ChatRoomMessage {
  MessageID: number;  // BIGINT AUTO_INCREMENT
  ChatRoomID: number;  // BIGINT
  SenderID: string;  // CHAR(36) - CHANGED
  Content?: string;  // TEXT
  MessageType: 'Text' | 'Image' | 'File';  // ENUM DEFAULT 'Text'
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
}

export interface Policy {
  PolicyID: number;  // BIGINT AUTO_INCREMENT
  Title?: string;  // VARCHAR
  Description?: string;  // TEXT
  PolicyType: 'Commission' | 'Refund' | 'General';  // ENUM NOT NULL
  Value?: number;  // INT
  CreatedAt: string;  // DATETIME DEFAULT CURRENT_TIMESTAMP
  IsActive: boolean;  // DEFAULT TRUE
}

// ==========================================================
// SUPPORTING TYPES (Inferred/Extended from Schema)
// ==========================================================

// Language (from Courses.Language, Tutor.TeachingLanguage)
export interface Language {
  name: string;
  code?: string;  // e.g., 'en'
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Availability (from Schedule)
export interface Availability {
  timezone?: string;
  schedules: Schedule[];  // Array
}

// WeekCurriculum (from CourseSection/Lessons)
export interface WeekCurriculum {
  week: number;  // Or SectionID
  title: string;
  lessons: Lesson[];
}

// Material/Resource (from LessonResource)
export interface Material {
  id: number;  // ResourceID
  title?: string;  // ResourceTitle
  type: 'PDF' | 'ExternalLink';  // ResourceType
  size?: string;
  downloadUrl: string;  // ResourceURL
}

// Comment/Reply (from CourseReview/Feedback)
export interface Comment {
  id: number;
  userId: string;  // UserID (UUID)
  message: string;  // Comment
  createdAt: string;
  replies?: Reply[];
}

export interface Reply {
  id: number;
  userId: string;
  message: string;
  createdAt: string;
}

// Practice Test (inferred from Courses/Lessons; no direct table)
export interface PracticeTest {
  id: number;
  title: string;
  language: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  questions: number;
  participants: number;
  rating: number;
  price?: number;
  description?: string;
}

// ==========================================================
// API RESPONSE & FORM TYPES (Updated)
// ==========================================================

// ApiResponse (match BE { result, message })
export interface ApiResponse<T> {
  result: T;
  message?: string;
  code?: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  result: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Forms (for /auth/token & /auth/register)
export interface SignInForm {
  username: string;  // BE /auth/token uses username (from Email or separate?)
  password: string;
  rememberMe?: boolean;
}

export interface SignUpForm {
  fullName?: string;
  email: string;  // NOT NULL
  phone?: string;
  password: string;
  confirmPassword?: string;  // Client-side
  // Add role?: 'Learner' if selectable
}

// Filters (client-side)
export interface CourseFilters {
  language: string;
  level: string;
  priceRange: string;
  categoryId?: number;  // From CourseCategory
  status?: 'Approved';  // From Courses.Status
}

export interface TutorFilters {
  language: string;  // TeachingLanguage
  priceRange: string;
  status?: 'Approved';  // From Tutor.Status
}
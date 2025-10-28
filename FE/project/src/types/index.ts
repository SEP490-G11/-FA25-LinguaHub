//định nghĩa kiểu dữ liệu (Type Definitions) cho toàn bộ Frontend.
//Mỗi object API trả về có cấu trúc thế nào,
// Các thuộc tính trong object tên gì, kiểu gì,
// Thuộc tính nào bắt buộc / tùy chọn,
// Và đảm bảo bạn không truyền sai dữ liệu khi code.

export interface User {
  UserID: string;
  email: string;
  PasswordHash: string;
  Role: 'Admin' | 'Tutor' | 'Learner';
  fullName?: string;
  AvatarURL?: string;
  Gender?: 'Male' | 'Female' | 'Other';
  DOB?: string;
  Phone?: string;
  Country?: string;
  Address?: string;
  Bio?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Verification {
  VerificationID: number;
  UserID: string;
  Type: 'Email' | 'Phone' | 'OTP';
  Code: string;
  ExpiredAt?: string;
  IsVerified: boolean;
}

// ==========================================================
// 2. TUTOR TYPES
// ==========================================================

export interface Tutor {
  TutorID: number;
  UserID: string;
  Experience: number;
  Specialization?: string;
  TeachingLanguage?: string;
  Bio?: string;
  Rating: number;
  Status: 'Pending' | 'Approved' | 'Suspended';
}

export interface TutorVerification {
  TutorVerificationID: number;
  UserID: string;
  Experience: number;
  Specialization?: string;
  TeachingLanguage?: string;
  Bio?: string;
  CertificateName?: string;
  DocumentURL?: string;
  Status: 'Pending' | 'Approved' | 'Rejected';
  SubmittedAt: string;
  ReviewedBy?: string;
  ReviewedAt?: string;
  ReasonForReject?: string;
}

// ==========================================================
// 3. COURSE & LESSON TYPES
// ==========================================================

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

// ==========================================================
// 4. SERVICES & BENEFITS
// ==========================================================

export interface Service {
  ServiceID: number;
  Title?: string;
  Duration?: number;
  Description?: string;
  Price?: number;
}

export interface ServiceBenefit {
  BenefitID: number;
  Title?: string;
  Description?: string;
  NumberUsage?: number;
  ServiceID?: number;
}

export interface UserService {
  UserServiceID: number;
  UserID: string;
  ServiceID?: number;
  StartDate?: string;
  IsActive: boolean;
  Title?: string;
  Duration?: number;
}

export interface UserServiceBenefit {
  UserServiceBenefitID: number;
  UserServiceID: number;
  Title?: string;
  Description?: string;
  NumberUsageRemaining?: number;
  NumberBooking?: number;
}

// ==========================================================
// 5. BOOKING & PAYMENT
// ==========================================================

export interface Schedule {
  ScheduleID: number;
  TutorID: number;
  StartTime: string;
  EndTime: string;
  IsAvailable: boolean;
}

export interface Booking {
  BookingID: number;
  UserID: string;
  TutorID: number;
  ScheduleID: number;
  UserServiceID?: number;
  Status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Payment {
  PaymentID: number;
  Amount?: number;
  PaymentType: 'Course' | 'Service';
  PaymentMethod: 'PAYOS' | 'VNPAY' | 'BANK';
  EnrollmentID?: number;
  UserServiceID?: number;
  IsPaid: boolean;
  IsRefund: boolean;
  ReceivedID?: string;
  AmountPaid?: number;

}

export interface Feedback {
  FeedbackID: number;
  UserID: string;
  PaymentID: number;
  Rating: number;
  Comment?: string;
}

// ==========================================================
// 6. CHAT & POLICY
// ==========================================================

export interface ChatRoom {
  ChatRoomID: number;
  Title?: string;
  Description?: string;
  UserID: string;
  TutorID?: number;
  ChatRoomType: 'Advice' | 'Training';
}

export interface ChatRoomMessage {
  MessageID: number;
  ChatRoomID: number;
  SenderID: string;
  Content?: string;
  MessageType: 'Text' | 'Image' | 'File';
  CreatedAt: string;
}

export interface Policy {
  PolicyID: number;
  Title?: string;
  Description?: string;
  PolicyType: 'Commission' | 'Refund' | 'General';
  Value?: number;
  CreatedAt: string;
  IsActive: boolean;
}

// ==========================================================
// SUPPORTING TYPES (Inferred/Extended from Schema)
// ==========================================================

// Language (from Courses.Language, Tutor.TeachingLanguage)
export interface Language {
  name: string;
  code?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Availability (from Schedule)
export interface Availability {
  timezone?: string;
  schedules: Schedule[];
}

// WeekCurriculum (from CourseSection/Lessons)
export interface WeekCurriculum {
  week: number;
  title: string;
  lessons: Lesson[];
}

// Material/Resource (from LessonResource)
export interface Material {
  id: number;
  title?: string;
  type: 'PDF' | 'ExternalLink';
  size?: string;
  downloadUrl: string;
}

// Comment/Reply (from CourseReview/Feedback)
export interface Comment {
  id: number;
  userId: string;
  message: string;
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
  email: string;
  password: string;
  confirmPassword?: string;
  // Add role?: 'Learner' if selectable
}

// Filters (client-side)
export interface CourseFilters {
  language: string;
  level: string;
  priceRange: string;
  categoryId?: number;
  status?: 'Approved';
}

export interface TutorFilters {
  language: string;
  priceRange: string;
  status?: 'Approved';
}
-- ==========================================================
-- DATABASE: LinguaHub - Centralized Language Tutor & LMS
-- Version: FINAL OPTIMIZED (v3)
-- Author: Bui Quang Thai
-- ==========================================================

CREATE DATABASE IF NOT EXISTS lingua_hub
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lingua_hub;

-- ==========================================================
-- 1. USERS (Merged Profile) & VERIFICATION
-- ==========================================================

CREATE TABLE Users (
    UserID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin','Tutor','Learner') NOT NULL DEFAULT 'Learner',
    FullName VARCHAR(255),
    AvatarURL VARCHAR(255),
    Gender ENUM('Male','Female','Other'),
    DOB DATE,
    Phone VARCHAR(20),
    Country VARCHAR(100),
    Address VARCHAR(255),
    Bio TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='System users including merged profile data';

CREATE TABLE Verification (
    VerificationID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    Type ENUM('Email','Phone','OTP') NOT NULL,
    Code VARCHAR(20) NOT NULL,
    ExpiredAt DATETIME,
    IsVerified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='User verification codes (email/phone/OTP)';

-- ==========================================================
-- 2. TUTOR & VERIFICATION
-- ==========================================================

CREATE TABLE Tutor (
    TutorID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL UNIQUE,
    Experience SMALLINT DEFAULT 0,
    Specialization VARCHAR(255),
    Rating DECIMAL(3,2) DEFAULT 0.0,
    Status ENUM('Pending','Approved','Suspended') DEFAULT 'Pending',
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tutor information and specialization details';

CREATE TABLE TutorVerification (
    TutorVerificationID BIGINT AUTO_INCREMENT PRIMARY KEY,
    TutorID BIGINT NOT NULL,
    DocumentURL VARCHAR(255),
    Status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    ReviewedBy BIGINT NULL,
    ReviewedAt DATETIME,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID) ON DELETE CASCADE,
    FOREIGN KEY (ReviewedBy) REFERENCES Users(UserID) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Tutor verification workflow and approval process';

-- ==========================================================
-- 3. COURSES & CATEGORY SYSTEM
-- ==========================================================

CREATE TABLE CourseCategory (
    CategoryID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Course categories (e.g., English, Korean, Japanese)';

CREATE TABLE Courses (
    CourseID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    TutorID BIGINT,
    Duration INT,
    Price DECIMAL(10,2) DEFAULT 0.00,
    CategoryID BIGINT,
    Language VARCHAR(50) DEFAULT 'English',
    ThumbnailURL VARCHAR(255),
    Status ENUM('Draft','Pending','Approved','Rejected','Disabled') DEFAULT 'Draft',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID) ON DELETE SET NULL,
    FOREIGN KEY (CategoryID) REFERENCES CourseCategory(CategoryID)
) ENGINE=InnoDB COMMENT='Courses created by tutors, with thumbnails and language metadata';

CREATE TABLE CourseSection (
    SectionID BIGINT AUTO_INCREMENT PRIMARY KEY,
    CourseID BIGINT NOT NULL,
    Title VARCHAR(255),
    Description TEXT,
    OrderIndex INT,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Sections (modules) within a course';

CREATE TABLE Lessons (
    LessonID BIGINT AUTO_INCREMENT PRIMARY KEY,
    SectionID BIGINT NOT NULL,
    Title VARCHAR(255),
    Duration SMALLINT,
    VideoURL VARCHAR(255),
    FOREIGN KEY (SectionID) REFERENCES CourseSection(SectionID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Lessons under each section';

CREATE TABLE Enrollments (
    EnrollmentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    CourseID BIGINT NOT NULL,
    Status ENUM('Active','Completed','Cancelled') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Learner course enrollments';

-- 🔹 Snapshot: Section progress tracking
CREATE TABLE UserCourseSection (
    UserCourseSectionID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    EnrollmentID BIGINT NOT NULL,
    SectionID BIGINT NOT NULL,
    Progress DECIMAL(5,2) DEFAULT 0.0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (EnrollmentID) REFERENCES Enrollments(EnrollmentID) ON DELETE CASCADE,
    FOREIGN KEY (SectionID) REFERENCES CourseSection(SectionID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tracks user progress per course section';

CREATE TABLE UserLesson (
    UserLessonID BIGINT AUTO_INCREMENT PRIMARY KEY,
    LessonID BIGINT,
    UserID BIGINT,
    EnrollmentID BIGINT,
    IsDone BOOLEAN DEFAULT FALSE,
    WatchedDuration INT DEFAULT 0,
    CompletedAt DATETIME,
    FOREIGN KEY (LessonID) REFERENCES Lessons(LessonID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (EnrollmentID) REFERENCES Enrollments(EnrollmentID)
) ENGINE=InnoDB COMMENT='User progress tracking per lesson';

CREATE TABLE CourseReview (
    ReviewID BIGINT AUTO_INCREMENT PRIMARY KEY,
    CourseID BIGINT NOT NULL,
    UserID BIGINT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Course feedback and rating system';

-- ==========================================================
-- 4. SERVICES & BENEFITS (1-1 BOOKING / PREMIUM)
-- ==========================================================

CREATE TABLE Services (
    ServiceID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Duration INT,
    Description TEXT,
    Price DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB COMMENT='Available premium services or tutoring packages';

CREATE TABLE ServiceBenefit (
    BenefitID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    NumberUsage INT DEFAULT 0,
    ServiceID BIGINT,
    FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Benefits associated with each service';

CREATE TABLE UserService (
    UserServiceID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT,
    ServiceID BIGINT,
    StartDate DATETIME,
    IsActive BOOLEAN DEFAULT TRUE,
    Title VARCHAR(255),
    Duration INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID)
) ENGINE=InnoDB COMMENT='User purchased services or tutoring plans';

CREATE TABLE UserServiceBenefit (
    UserServiceBenefitID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserServiceID BIGINT,
    Title VARCHAR(255),
    Description TEXT,
    NumberUsageRemaining INT DEFAULT 0,
    NumberBooking INT DEFAULT 0,
    FOREIGN KEY (UserServiceID) REFERENCES UserService(UserServiceID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tracks usage of benefits per user service';

-- ==========================================================
-- 5. BOOKING & PAYMENT SYSTEM
-- ==========================================================

CREATE TABLE Schedule (
    ScheduleID BIGINT AUTO_INCREMENT PRIMARY KEY,
    TutorID BIGINT NOT NULL,
    StartTime DATETIME,
    EndTime DATETIME,
    IsAvailable BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tutor availability schedule for bookings';

CREATE TABLE Booking (
    BookingID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT,
    TutorID BIGINT,
    ScheduleID BIGINT,
    UserServiceID BIGINT,
    Status ENUM('Pending','Confirmed','Cancelled','Completed') DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID),
    FOREIGN KEY (ScheduleID) REFERENCES Schedule(ScheduleID),
    FOREIGN KEY (UserServiceID) REFERENCES UserService(UserServiceID)
) ENGINE=InnoDB COMMENT='1-on-1 tutoring booking records';

CREATE TABLE Payments (
    PaymentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Amount DECIMAL(10,2),
    PaymentType ENUM('Course','Service'),
    PaymentMethod ENUM('PAYOS','VNPAY','BANK'),
    EnrollmentID BIGINT NULL,
    UserServiceID BIGINT NULL,
    IsPaid BOOLEAN DEFAULT FALSE,
    IsRefund BOOLEAN DEFAULT FALSE,
    ReceivedID BIGINT NULL,
    AmountPaid DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (EnrollmentID) REFERENCES Enrollments(EnrollmentID) ON DELETE SET NULL,
    FOREIGN KEY (UserServiceID) REFERENCES UserService(UserServiceID) ON DELETE SET NULL,
    FOREIGN KEY (ReceivedID) REFERENCES Users(UserID) ON DELETE SET NULL,
    CHECK (
        (EnrollmentID IS NOT NULL AND UserServiceID IS NULL)
        OR (EnrollmentID IS NULL AND UserServiceID IS NOT NULL)
    )
) ENGINE=InnoDB COMMENT='Handles all payment transactions';

CREATE TABLE Feedback (
    FeedbackID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT,
    PaymentID BIGINT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID)
) ENGINE=InnoDB COMMENT='Feedback for completed services or courses';

-- ==========================================================
-- 6. CHAT & POLICY MANAGEMENT
-- ==========================================================

CREATE TABLE ChatRoom (
    ChatRoomID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    UserID BIGINT,
    TutorID BIGINT,
    ChatRoomType ENUM('Advice','Training') DEFAULT 'Training',
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID)
) ENGINE=InnoDB COMMENT='Private chat room between learner and tutor';

CREATE TABLE ChatRoomMessage (
    MessageID BIGINT AUTO_INCREMENT PRIMARY KEY,
    ChatRoomID BIGINT,
    SenderID BIGINT,
    Content TEXT,
    MessageType ENUM('Text','Image','File') DEFAULT 'Text',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ChatRoomID) REFERENCES ChatRoom(ChatRoomID),
    FOREIGN KEY (SenderID) REFERENCES Users(UserID)
) ENGINE=InnoDB COMMENT='Messages within chat rooms (chat history)';

CREATE TABLE Policy (
    PolicyID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    PolicyType ENUM('Commission','Refund','General') NOT NULL,
    Value INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB COMMENT='System-wide policies and configurations';

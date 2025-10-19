-- ==========================================================
-- DATABASE: LinguaHub - Centralized Language Tutor & LMS
-- Optimized for Spring Boot + MySQL 8.x
-- Author: Bui Quang Thai (2025-10-17)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS lingua_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lingua_hub;

-- ==========================================================
-- 1. USERS & ROLES
-- ==========================================================

CREATE TABLE Role (
    RoleID BIGINT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(100) NOT NULL,
    Description VARCHAR(255)
) ENGINE=InnoDB COMMENT='User roles and permissions';

CREATE TABLE Users (
    UserID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleID BIGINT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (RoleID) REFERENCES Role(RoleID)
) ENGINE=InnoDB COMMENT='System users';

CREATE TABLE Profile (
    ProfileID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    FullName VARCHAR(255),
    AvatarURL VARCHAR(255),
    Gender ENUM('Male','Female','Other'),
    DOB DATE,
    Phone VARCHAR(20),
    Country VARCHAR(100),
    Address VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='User profiles';

CREATE TABLE Verification (
    VerificationID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    Type ENUM('Email','Phone','OTP') NOT NULL,
    Code VARCHAR(20) NOT NULL,
    ExpiredAt DATETIME,
    IsVerified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='User account verification';

-- ==========================================================
-- 2. TUTOR & VERIFICATION
-- ==========================================================

CREATE TABLE Tutor (
    TutorID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL UNIQUE,
    Bio TEXT,
    Experience SMALLINT DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0.0,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tutor profiles and experience';

CREATE TABLE TutorVerification (
    TutorVerificationID BIGINT AUTO_INCREMENT PRIMARY KEY,
    TutorID BIGINT NOT NULL,
    DocumentURL VARCHAR(255),
    Status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    ReviewedBy BIGINT NULL,
    ReviewedAt DATETIME,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID) ON DELETE CASCADE,
    FOREIGN KEY (ReviewedBy) REFERENCES Users(UserID) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Tutor verification workflow';

-- ==========================================================
-- 3. COURSE & CATEGORY SYSTEM
-- ==========================================================

CREATE TABLE CourseCategory (
    CategoryID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Course categories';

CREATE TABLE Courses (
    CourseID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    TutorID BIGINT,
    Duration INT,
    Price DECIMAL(10,2) DEFAULT 0.00,
    CategoryID BIGINT,
    Status ENUM('Draft','Pending','Approved','Rejected','Disabled') DEFAULT 'Draft',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (TutorID) REFERENCES Tutor(TutorID) ON DELETE SET NULL,
    FOREIGN KEY (CategoryID) REFERENCES CourseCategory(CategoryID)
) ENGINE=InnoDB COMMENT='Courses created by tutors';

CREATE TABLE CourseSection (
    SectionID BIGINT AUTO_INCREMENT PRIMARY KEY,
    CourseID BIGINT NOT NULL,
    Title VARCHAR(255),
    Description TEXT,
    OrderIndex INT,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Sections of a course';

CREATE TABLE Lessons (
    LessonID BIGINT AUTO_INCREMENT PRIMARY KEY,
    CourseID BIGINT NOT NULL,
    Title VARCHAR(255),
    Duration SMALLINT,
    VideoURL VARCHAR(255),
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Lessons within courses';

CREATE TABLE Enrollments (
    EnrollmentID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT NOT NULL,
    CourseID BIGINT NOT NULL,
    Status ENUM('Active','Completed','Cancelled') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Learner enrollments in courses';

CREATE TABLE CourseReview (
    ReviewID BIGINT AUTO_INCREMENT PRIMARY KEY,
    CourseID BIGINT NOT NULL,
    UserID BIGINT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Course reviews and feedback';

-- ==========================================================
-- 4. SERVICES & BENEFITS (PREMIUM / 1-1)
-- ==========================================================

CREATE TABLE Services (
    ServiceID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Duration INT,
    Description TEXT,
    Price DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB COMMENT='Available services (e.g., 1-1 tutoring)';

CREATE TABLE ServiceBenefit (
    BenefitID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    NumberUsage INT DEFAULT 0,
    ServiceID BIGINT,
    FOREIGN KEY (ServiceID) REFERENCES Services(ServiceID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Service benefits and perks';

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
) ENGINE=InnoDB COMMENT='User purchased or subscribed services';

CREATE TABLE UserServiceBenefit (
    UserServiceBenefitID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserServiceID BIGINT,
    Title VARCHAR(255),
    Description TEXT,
    NumberUsageRemaining INT DEFAULT 0,
    NumberBooking INT DEFAULT 0,
    FOREIGN KEY (UserServiceID) REFERENCES UserService(UserServiceID) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Tracking usage of benefits';

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
) ENGINE=InnoDB COMMENT='Tutor available schedule slots';

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
) ENGINE=InnoDB COMMENT='1-1 bookings between learners and tutors';

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
    CHECK ((EnrollmentID IS NOT NULL AND UserServiceID IS NULL) OR (EnrollmentID IS NULL AND UserServiceID IS NOT NULL))
) ENGINE=InnoDB COMMENT='Payment transactions for course/service';

CREATE TABLE Feedback (
    FeedbackID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT,
    PaymentID BIGINT,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID)
) ENGINE=InnoDB COMMENT='Feedback after payment/course/service';

-- ==========================================================
-- 6. CHAT & POLICY
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
) ENGINE=InnoDB COMMENT='Chat rooms between learner and tutor';

CREATE TABLE ChatRoomMessage (
    MessageID BIGINT AUTO_INCREMENT PRIMARY KEY,
    ChatRoomID BIGINT,
    SenderID BIGINT,
    Content TEXT,
    MessageType ENUM('Text','Image','File') DEFAULT 'Text',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ChatRoomID) REFERENCES ChatRoom(ChatRoomID),
    FOREIGN KEY (SenderID) REFERENCES Users(UserID)
) ENGINE=InnoDB COMMENT='Messages exchanged in chat rooms';

CREATE TABLE Policy (
    PolicyID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255),
    Description TEXT,
    PolicyType ENUM('Commission','Refund','Text'),
    Value INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB COMMENT='Platform policies like commission rate or refund rules';

-- ==========================================================
-- SEED DATA
-- ==========================================================

INSERT INTO Role (RoleName, Description) VALUES 
('Admin', 'System administrator'),
('Tutor', 'Certified tutor'),
('Learner', 'Regular learner');

INSERT INTO Users (Email, PasswordHash, RoleID) VALUES
('admin@linguahub.vn', 'hashed_pw', 1),
('tutor@linguahub.vn', 'hashed_pw', 2),
('learner@linguahub.vn', 'hashed_pw', 3);

INSERT INTO Tutor (UserID, Bio, Experience, Rating) VALUES 
(2, 'Experienced English tutor specialized in communication skills', 3, 4.8);

INSERT INTO CourseCategory (Name, Description) VALUES
('Ngôn ngữ', 'Các khóa học tiếng Anh, Nhật, Hàn,...');

INSERT INTO Courses (Title, Description, TutorID, Duration, Price, CategoryID, Status)
VALUES ('Tiếng Anh Giao Tiếp Cơ Bản', 'Khóa học giúp bạn tự tin giao tiếp hằng ngày', 1, 30, 500000, 1, 'Approved');

# REQUIREMENT
 - Database: MySQL
 - Authentication: JWT (JSON Web Token)
 - Authorization: Required
 - Secured: Onlu Admin is allowed to perform management actions
 - Status workflow:
    - Tutor: PENDIND -> APPROVED or PENDING -> REJECTED/SUSPENDED
    - TutorVerification: PENDING → APPROVED or PENDING → REJECTED
 - All request actions are audited (reviewed_by, reviewed_at)

## Entity: Tutor
- TutorID 
- UserID 
- Experience (Default: 0)
- Specialization 
- TeachingLanguage 
- Bio 
- Rating (Default: 0.0)
- Status: ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') (Default: 'PENDING')

## Entity: TutorVerification
- TutorVerificationID 
- UserID 
- Experience (Default: 0)
- Specialization 
- TeachingLanguage 
- Bio 
- CertificateName 
- DocumentURL 
- Status: ENUM('PENDING', 'APPROVED', 'REJECTED') (Default: 'PENDING')
- SubmittedAt (Default: CURRENT_TIMESTAMP)
- ReviewedBy 
- ReviewedAt 
- ReasonForReject

## API: Tutor Application (User Side)
### Submit tutor application

- Method: POST /tutors/apply 
- Description: User submits a request to become a tutor.

### Check application status

- Method: GET /tutors/apply/status 
- Description: Retrieve the current verification status of logged-in user.

## API: Tutor Management (Admin Only)

### List/Search tutors

- Method: GET /admin/tutors 
- Description: Retrieve list of tutors with pagination, sorting, filter by status or keyword (name/email). 
- Query: page, size, sortBy, keyword (optional), status (optional)

### View tutor details

- Method: GET /admin/tutors/{id} 
- Description: View tutor details including User info, verification status, experience, specialization.

### Approve tutor

- Method: PUT /admin/tutors/{id}/approve 
- Description: Change status from Pending to Approved.

### Reject tutor

- Method: PUT /admin/tutors/{id}/reject 
- Description: Change TutorVerification status to Rejected. 
- Optional: note/reason

### Suspend tutor (Soft Delete)

- Method: PUT /admin/tutors/{id}/suspend 
- Description: Change status from Approved to Suspended.

### Activate tutor (Unsuspend)

- Method: PUT /admin/tutors/{id}/activate 
- Description: Change status from Suspended to Approved.

### Update tutor information (optional)

- Method: PATCH /admin/tutors/{id} 
- Description: Update specialization or experience (admin intervention).

### Constraints & Business Rules (Rule - Applies to)
- Only ADMIN can approve or reject a tutor - API level
- Tutor must exist before approval - Approve/Reject
- Tutor must be in Pending status to approve/reject - Approve/Reject
- TutorVerification must exist for Tutor - Approve/Reject
- On approve: Tutor.Status → Approved - Tutor
- On approve: TutorVerification.Status → Approved - TutorVerification
- On approve: ReviewedBy MUST be a valid AdminID - TutorVerification
- On reject: Tutor.Status stays Pending or may set Suspended (optional) - Tutor
- On reject: TutorVerification.Status → Rejected - TutorVerification
- On reject: ReviewedBy MUST be a valid AdminID - TutorVerification
- ReviewedAt MUST be updated on both approve/reject - TutorVerification
- System SHOULD NOT allow re-approval if already Approved or Rejected - Approve
- User.Role optionally updated to Tutor after approval (if business rule requires) - Users

### Constraints & Business Rules (Rule - Applies to)
- Only ADMIN can approve or reject a tutor - API level
- Tutor must exist before approval - Approve/Reject
- Tutor must be in Pending status to approve/reject - Approve/Reject 
- TutorVerification must exist for Tutor - Approve/Reject 
- On approve: Tutor.Status → Approved - Tutor 
- On approve: TutorVerification.Status → Approved - TutorVerification
- On approve: ReviewedBy MUST be a valid AdminID - TutorVerification 
- On reject: Tutor.Status stays Pending or may set Suspended (optional) - Tutor 
- On reject: TutorVerification.Status → Rejected - TutorVerification 
- On reject: ReviewedBy MUST be a valid AdminID - TutorVerification 
- ReviewedAt MUST be updated on both approve/reject - TutorVerification 
- System SHOULD NOT allow re-approval if already Approved or Rejected - Approve 
- User.Role optionally updated to Tutor after approval (if business rule requires) - Users 


### 6. Approval Flow
1. Tutor submits verification request → record created in Tutor (Status: Pending)
2. Tutor uploads documents → stored in TutorVerification (Status: Pending)
3. Admin views Pending tutor list
4. Admin selects a tutor and approves or rejects:
    - If APPROVED:
        - Update Tutor.Status = 'Approved'
        - Update TutorVerification.Status = 'Approved'
        - Update ReviewedBy and ReviewedAt
        - (Optional) Update User.Role = 'Tutor'
    - If REJECTED:
        - Update TutorVerification.Status = 'Rejected'
        - Update ReviewedBy and ReviewedAt
        - Tutor.Status may remain Pending or change to Suspended based on policy
5. Tutor is now eligible to create courses if approved


#### Lesson
- LessonID
- SectionID
- Title
- Duration
- LessonType Enum(Video, Reading) Default: Video
- VideoURL
- Context
- OrderIndex
- CreatedAt default current_timestamp

#### LessonResource
- ResourceID
- LessonID
- ResourceType Enum(PDF, ExternalLink) Default: PDF
- ResourceTitle
- ResourceURL
- UploadedAt default current_timestamp

#### API: Lesson Management
## View all lesson in a section
- Method: GET /tutors/coursesections/{coursesectionId}/lessons 
- Description: Get a list of all lessons in a CourseSection. 
- Query: sortBy, order (ASC/DESC), keyword (optional).

## Create a new Lesson
- Method: POST /tutors/coursesections/{coursesectionId}/lessons
- Description: Tutor creates a new lesson in an existing CourseSection.

## View Lesson Detail
- Method: GET /tutors/lessons/{lessonId}
- Description: View detailed lesson content, with a list of LessonResources.

## Update Lesson
- Method: PUT /tutors/lessons/{lessonId}
- Description: Tutor edits lesson information.

## Delete Lesson
- Method: DELETE /tutors/lessons/{lessonId} 
- Description:Tutor deleted a lesson (including related Lesson Resources). 
- Behavior:
     - Soft delete 
     - Deletes all Lesson Resources with corresponding lessonIDs.


#### API: LessonResource Management

## Add lesson resource
- Method: POST /tutors/lessons/{lessonId}/resources 
- Description: Add resources (PDF or external links) to Lesson.

## View Lesson Resources
- Method: GET /tutors/lessons/{lessonId}/resources
- Description: View a list of all resources for a lesson.

## Update Lesson Resource
- Method: PUT /tutors/resources/{resourceId}
- Description: Update resource information (e.g. change link or name).

## Delete Lesson Resource
- Method: DELETE /tutors/resources/{resourceId}
- Description: Delete a resource associated with a lesson. (Soft delete)



### Booking slot
## Entity Booking plan
- BookingPlanID
- TutorID
- Title
- Description
- SlotDuration int default 30
- PricePerSlot
- StartHour
- EndHour
- ActiveDays: Mon, Tue, Wed, Thu, Fri
- WeekToGenerate: 1,2,3,4....
- MaxLearner default 1
- CreatedAt
- UpdateAt

## Entity Schedule
- ScheduleID
- TutorID
- StartTime
- EndTime
- IsAvailable default true


## API Tutor create slot booking
- Method POST /tutors/booking-plans
- Allow approved Tutors (Status = APPROVED) to create a teaching plan (BookingPlan),
the system will automatically generate slots (Schedule) for the following weeks.

1. Activity Flow
- Tutor (approved) sends request to create plan.
- System checks: 
  - Tutor.status =  APPROVED
  - StartHour < EndHour
  - SlotDuration is divisible by total teaching minutes per day
  - Does not overlap with other plans of the same tutor.
- System creates record in BookingPlan.
- Based on values:
  - ActiveDays
  - StartHour & EndHour
  - SlotDuration
  - WeekToGenerate
    → Generate Schedule (each slot is a record in the Schedule table).
- Each slot is initialized with IsAvailable = TRUE.
- Returns plan information and number of generated slots.
## API Tutor view booking slot
- Method GET /tutors/{tutorId}/schedules
- Displays all tutor schedules for the week, along with availability.

1. Activity Flow
- Tutor sends a request to view slots (with week or dateRange). 
- The system retrieves slots in the Schedule by TutorID in the corresponding time period. 
- The result returns a list of slots (sorted by time). 

## Business Rules
- Only approved tutors can create booking plans. mApplies to: BookingPlan
Description: Only tutors with status Tutor.Status = 'APPROVED' are allowed to create booking plans. 
- A tutor cannot create overlapping booking plans. Applies to: BookingPlan
Description: A tutor is not allowed to create booking plans with overlapping time slots. The system needs to check and validate to avoid time conflicts when creating new ones.
- Generated schedules cannot overlap existing ones. Applies to: Schedule
Description: Schedules (slots) generated from booking plans cannot overlap with existing slots of the same tutor. The system needs to ensure that each StartTime is unique for each tutor.
- When a slot is booked → IsAvailable = FALSE. Applies to: Schedule
Description: When a learner successfully books a slot, the IsAvailable field of the corresponding slot in the Schedule table must be updated to FALSE.
- When booking is cancelled → IsAvailable = TRUE. Applies to: Schedule
Description: When a learner cancels the booking, the corresponding slot needs to be reopened so that others can book. The system will update IsAvailable = TRUE to mark the slot as empty again.

### Entity ChatRoom
- ChatRoomID
- Title
- Description
- UserID: Learner
- TutorID
- ChatRoomType ENUM(Advice, Training) default Training

### Entity ChatRoomMessage
- MessageID
- ChatRoomID
- SenderID
- Context
- MessageType ENUM(Texr, Image, File) Default Text
- CreatedAt 

### Entity Booking
- BookingID
- UserID
- TutorID
- ScheduleID
- UserBookingPlanID
- Status ENUM (Booked, Cancelled, Completed) default Booked
- MeetingLink
- CreatedAt
- UpdatedAt

### Entity Users
- UserID
- Email
- PasswordHash
- Role ENUM (Admin, Tutor, Learner) default Learner
- FullName
- AvatarURL
- Gender ENUM (Male, Female, Other)
- DOB (Date of birth)
- Phone
- Country
- Address
- Bio
- IsActive
- CreatedAt
- UpdatedAt

### Entity Tutor
- TutorID
- UserID
- Experience
- Specialization
- TeachingLanguage
- Bio
- Rating
- Status ENUM(Pending, Approved, Suspended) default Pending


## Active flow
A. Advice chat
- Allow Learners to ask before booking
  1. Learner views Tutor profile → click “Chat to Ask” In UI “Tutor Profile” 
  2. Backend checks if there is an Advice room between Learner & Tutor in ChatRoom 
  3. If not → create a new ChatRoom 
  4. Learner can send text messages (or emoji) MessageType='Text'
  5. Tutor responds to advice (introduce course, price, schedule, etc.)
  6. Learner decides to Book Tutor → System switches to “Training Chat” flow 
B. Training Chat
- Support chat during the learning process - meaning Learner has booked tutor (has Booking record). 
  1. Learner successfully booked slot (Booking.Status='Booked')
  2. The system checks if there is a Training room between Learner and Tutor
  3. If not → create a new room:
  4. Learner and Tutor can send:
  • Text messages
  • Photos (image upload)
  • PDF files/documents
  • Google Meet links (MessageType='Text', content contains URL) 
  5. Tutor can send GG Meet links automatically (from Booking.MeetingLink) into chat
  6. Learner and Tutor can exchange during the learning process.
## Business Rule
- Each Learner-Tutor pair has only 1 Advice room and 1 Training room.
- Advice can only send text, not files. Advice
- Training allows sending Text, Image, File, Link
- When Booking is created → the system automatically generates ChatRoom Training (if not yet available)
- When Booking is canceled → ChatRoom still keeps history but does not send new messages
- When Tutor is suspended → both Advice and Training are read-only.

                                                   
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

<<<<<<< HEAD
=======

>>>>>>> origin/main
>

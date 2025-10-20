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
- Experience Default: 0
- Specialization
- Rating Default: 0.0
- Status: ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') Default Pending

## Entity: TutorVerification
- TutorVerificationID
- TutorID
- DocumentURL
- Status: ENUM('PENDING', 'APPROVED', 'REJECTED') Default Pending
- ReviewedBy
- ReviewedAt


### API: Tutor Management (Admin Only)

### 4.1. List/Search tutors
- Method: GET `/admin/tutors`
- Description: Retrieve list of tutors with pagination, sorting, filter by status or keyword (name/email).
- Query: page, size, sortBy, keyword (optional), status (optional)

### 4.2. View tutor details
- Method: GET `/admin/tutors/{id}`
- Description: View tutor details including User info, verification status, experience, specialization.

### 4.3. Approve tutor
- Method: PUT `/admin/tutors/{id}/approve`
- Description: Change status from Pending to Approved.

### 4.4. Reject tutor
- Method: PUT `/admin/tutors/{id}/reject`
- Description: Change TutorVerification status to Rejected.
- Optional: note/reason

### 4.5. Suspend (Soft Delete)
- Method: PUT `/admin/tutors/{id}/suspend`
- Description: Change status from Approved to Suspended.

### 4.6. Activate tutor (unsuspend)
- Method: PUT `/admin/tutors/{id}/activate`
- Description: Change status from Suspended to Approved.

### 4.7. Update tutor information (optional)
- Method: PATCH `/admin/tutors/{id}`
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


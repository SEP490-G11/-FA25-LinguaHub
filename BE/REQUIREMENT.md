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

#### 4.1. Get list of tutor requests
- Method: GET `/admin/tutors/pending`
- Description: Retrieve list of tutors with status = Pending
- Role allowed: Admin
- Query: pagination, sorting by created time or name

#### 4.2. Approve tutor request
- Method: PUT `/admin/tutors/{id}/approve`
- Description: Approve a tutor request
- Role allowed: Admin
- Body: reviewed_by

#### 4.3. Reject tutor request
- Method: PUT `/admin/tutors/{id}/reject`
- Description: Reject a tutor request
- Role allowed: Admin
- Body: reviewed_by, optional reason

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

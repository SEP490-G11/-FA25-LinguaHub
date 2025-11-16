# API Response Mapping

## Backend DTOs → Frontend Types

### 1. AdminCourseResponse (Live Course)

**Backend:**
```java
AdminCourseResponse {
  Long id;                    // ⚠️ NOT courseID!
  String title;
  String shortDescription;
  String description;
  String requirement;
  CourseLevel level;
  Integer duration;
  BigDecimal price;
  String language;
  String thumbnailURL;
  String categoryName;        // ⚠️ No categoryID
  String tutorEmail;
  String tutorName;           // ⚠️ No tutorID
  String status;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  String adminReviewNote;
}
```

**Frontend Mapping:**
```typescript
{
  id: course.id,              // ✅ Use 'id' field
  categoryID: 0,              // ❌ Not provided
  tutorID: 0,                 // ❌ Not provided
  isDraft: false,
  // ... other fields map directly
}
```

---

### 2. AdminCourseDraftResponse (Draft Course)

**Backend:**
```java
AdminCourseDraftResponse {
  Long draftID;               // ⚠️ Primary ID for draft
  Long courseID;              // Original course ID
  String title;
  String shortDescription;
  String description;
  String requirement;
  String level;
  Integer duration;
  BigDecimal price;
  String language;
  String thumbnailURL;
  String categoryName;        // ⚠️ No categoryID
  String tutorEmail;
  String tutorName;           // ⚠️ No tutorID
  String status;              // CourseDraftStatus
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  String adminReviewNote;
}
```

**Frontend Mapping:**
```typescript
{
  id: draft.draftID,          // ✅ Use 'draftID' field
  categoryID: 0,              // ❌ Not provided
  tutorID: 0,                 // ❌ Not provided
  isDraft: true,
  // ... other fields map directly
}
```

---

### 3. AdminCourseDetailResponse (Full Detail)

**Backend:**
```java
AdminCourseDetailResponse {
  Long id;                    // courseID (live) or draftID (draft)
  Long courseID;              // Always original course ID
  Boolean draft;              // true = draft, false = live
  String title;
  String shortDescription;
  String description;
  String requirement;
  String level;
  Integer duration;
  BigDecimal price;
  String language;
  String thumbnailURL;
  String categoryName;
  String tutorEmail;
  String tutorName;
  String status;
  LocalDateTime createdAt;
  LocalDateTime updatedAt;
  String adminReviewNote;
  List<CourseSectionResponse> sections;
  List<String> objectives;    // ⚠️ Array of strings, not objects!
}
```

**Frontend Mapping:**
```typescript
{
  id: data.id,                // ✅ Use 'id' field
  section: data.sections,     // ✅ Direct mapping
  objectives: data.objectives.map((text, index) => ({
    objectiveID: index + 1,   // ⚠️ Generate ID
    objectiveText: text,
    orderIndex: index,
  })),
  adminNotes: data.adminReviewNote,
  isDraft: data.draft,        // ✅ Use 'draft' boolean
  // ... other fields
}
```

---

## API Endpoints

### Get Pending Courses

**Live Courses:**
```
GET /admin/courses/by-status?status=Pending
Response: { result: AdminCourseResponse[] }
```

**Draft Courses:**
```
GET /admin/courses/drafts?status=PENDING_REVIEW
Response: { result: AdminCourseDraftResponse[] }
```

### Get Course Detail

**Live Course:**
```
GET /admin/courses/{id}/detail
Response: { result: AdminCourseDetailResponse }
```

**Draft Course:**
```
GET /admin/courses/drafts/{draftID}/detail
Response: { result: AdminCourseDetailResponse }
```

### Approve Course

**Live Course:**
```
POST /admin/courses/{id}/approve
Body: { note?: string }
Response: { result: AdminCourseResponse }
```

**Draft Course:**
```
POST /admin/courses/drafts/{draftID}/approve
Body: (empty or { note?: string })
Response: { result: AdminCourseResponse }
```

### Reject Course

**Live Course:**
```
POST /admin/courses/{id}/reject
Body: { note: string }  // Required!
Response: { result: AdminCourseResponse }
```

**Draft Course:**
```
POST /admin/courses/drafts/{draftID}/reject
Body: { note?: string }  // Optional
Response: { message: string }
```

---

## Important Notes

### ⚠️ Missing Fields

Backend responses **DO NOT** include:
- `categoryID` (only `categoryName`)
- `tutorID` (only `tutorName` and `tutorEmail`)

These are set to `0` in frontend mapping.

### ⚠️ Field Name Differences

| Backend | Frontend |
|---------|----------|
| `id` | `id` (live course) |
| `draftID` | `id` (draft course) |
| `adminReviewNote` | `adminNotes` |
| `draft` (boolean) | `isDraft` |
| `objectives` (string[]) | `objectives` (Objective[]) |

### ⚠️ HTTP Methods

- Approve/Reject use **POST** (not PUT)
- Body uses `{ note: string }` (not `adminNotes` or `rejectionReason`)

---

## Console Logs for Debugging

The API now includes console logs:
- `📊 Live courses response`
- `📊 Draft courses response`
- `🔍 Mapping live course`
- `🔍 Mapping draft course`
- `✅ All mapped courses`
- `🔍 Fetching course detail`
- `📊 Course detail response`

Check browser console to debug mapping issues.

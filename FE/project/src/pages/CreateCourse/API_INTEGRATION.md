# API Integration Guide

## 🔗 Backend Endpoints

### Base URL
```
http://localhost:8080
```

---

## 📋 Complete API Flow

### Step 1: Create Course (Basic Info)

**Endpoint:** `POST /tutor/courses`

**Request Body:**
```json
{
  "title": "IELTS Writing Foundation BY Tutor huy nam",
  "description": "Learn how to write IELTS Task 1 and Task 2 essays effectively.",
  "duration": 30,
  "price": 2500000,
  "language": "English",
  "thumbnailURL": "https://example.com/ielts-writing.jpg",
  "categoryID": 2
}
```

**Response:**
```json
{
  "courseId": "3"
}
```

**Frontend Code:**
```typescript
// api.ts
export async function createCourseApi(data: CourseFormData): Promise<CreateCourseResponse> {
  const response = await axios.post('/tutor/courses', {
    title: data.title,
    description: data.description,
    categoryID: data.categoryID,      // number
    language: data.language,          // string
    duration: data.duration,
    price: data.price,
    thumbnailURL: data.thumbnailURL,
  });
  
  return {
    success: true,
    courseId: String(response.data.courseId),
  };
}
```

---

### Step 2a: Create Section

**Endpoint:** `POST /tutor/courses/sections/{courseId}`

**Example:** `POST /tutor/courses/sections/3`

**Request Body:**
```json
{
  "title": "Part 1 - Writing Introduction",
  "description": "Learn how to write strong introductions for IELTS essays.",
  "orderIndex": 0
}
```

**Response:**
```json
{
  "sectionId": "6"
}
```

**Frontend Code:**
```typescript
// api.ts
export async function createSectionApi(
  courseId: string,
  section: SectionData
): Promise<{ sectionId: string }> {
  const response = await axios.post(`/tutor/courses/sections/${courseId}`, {
    title: section.title,
    description: section.description,
    orderIndex: section.order_index,
  });
  
  return { sectionId: String(response.data.sectionId) };
}
```

---

### Step 2b: Create Lesson

**Endpoint:** `POST /tutor/courses/sections/{sectionId}/lessons`

**Example:** `POST /tutor/courses/sections/6/lessons`

**Request Body:**
```json
{
  "title": "Lesson 1 - How to Paraphrase",
  "duration": 15,
  "lessonType": "Video",
  "videoURL": "https://example.com/paraphrase.mp4",
  "content": "This lesson teaches how to paraphrase IELTS writing prompts.",
  "orderIndex": 0
}
```

**Response:**
```json
{
  "lessonId": "1"
}
```

**Frontend Code:**
```typescript
// api.ts
export async function createLessonApi(
  sectionId: string,
  lesson: LessonData
): Promise<{ lessonId: string }> {
  const response = await axios.post(`/tutor/courses/sections/${sectionId}/lessons`, {
    title: lesson.title,
    duration: lesson.duration_minutes,
    lessonType: lesson.lesson_type,      // "Video" | "Reading"
    videoURL: lesson.video_url,
    content: lesson.content,
    orderIndex: lesson.order_index,
  });
  
  return { lessonId: String(response.data.lessonId) };
}
```

---

### Step 2c: Create Resource

**Endpoint:** `POST /tutor/lessons/{lessonId}/resources`

**Example:** `POST /tutor/lessons/1/resources`

**Request Body:**
```json
{
  "resourceType": "ExternalLink",
  "resourceTitle": "Paraphrasing Guide",
  "resourceURL": "https://example.com/paraphrase-guide.pdf"
}
```

**Response:**
```json
{
  "success": true
}
```

**Frontend Code:**
```typescript
// api.ts
export async function createResourceApi(
  lessonId: string,
  resource: LessonResource
): Promise<void> {
  await axios.post(`/tutor/lessons/${lessonId}/resources`, {
    resourceType: resource.resource_type,     // "PDF" | "ExternalLink"
    resourceTitle: resource.resource_title,
    resourceURL: resource.resource_url,
  });
}
```

---

## 🔄 Complete Flow Example

### User creates course with this structure:

```
Course: "IELTS Writing Foundation"
└── Section 1: "Part 1 - Writing Introduction"
    └── Lesson 1: "How to Paraphrase"
        └── Resource 1: "Paraphrasing Guide" (PDF link)
```

### API Call Sequence:

```typescript
// 1. Create Course
const { courseId } = await createCourseApi({
  title: "IELTS Writing Foundation",
  description: "...",
  categoryID: 2,
  language: "English",
  duration: 30,
  price: 2500000,
  thumbnailURL: "...",
});
// courseId = "3"

// 2. Create Section
const { sectionId } = await createSectionApi("3", {
  title: "Part 1 - Writing Introduction",
  description: "...",
  order_index: 0,
  lessons: [...],
});
// sectionId = "6"

// 3. Create Lesson
const { lessonId } = await createLessonApi("6", {
  title: "Lesson 1 - How to Paraphrase",
  duration_minutes: 15,
  lesson_type: "Video",
  video_url: "...",
  content: "...",
  order_index: 0,
  resources: [...],
});
// lessonId = "1"

// 4. Create Resource
await createResourceApi("1", {
  resource_type: "ExternalLink",
  resource_title: "Paraphrasing Guide",
  resource_url: "...",
});
```

---

## 🎯 saveCourseContentApi Implementation

This function orchestrates all the API calls:

```typescript
export async function saveCourseContentApi(
  courseId: string,
  sections: SectionData[]
): Promise<CreateCourseResponse> {
  try {
    // Loop qua từng section
    for (const section of sections) {
      // 1. Tạo section
      const { sectionId } = await createSectionApi(courseId, section);
      
      // 2. Loop qua từng lesson trong section
      for (const lesson of section.lessons) {
        // Tạo lesson
        const { lessonId } = await createLessonApi(sectionId, lesson);
        
        // 3. Loop qua từng resource trong lesson (nếu có)
        if (lesson.resources && lesson.resources.length > 0) {
          for (const resource of lesson.resources) {
            await createResourceApi(lessonId, resource);
          }
        }
      }
    }
    
    return {
      success: true,
      courseId: courseId,
      message: 'Course content saved successfully',
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to save course content');
  }
}
```

---

## 📊 Field Mapping

### Frontend → Backend

| Frontend Field | Backend Field | Type | Notes |
|----------------|---------------|------|-------|
| `duration_minutes` | `duration` | number | Lesson duration |
| `lesson_type` | `lessonType` | string | "Video" or "Reading" |
| `video_url` | `videoURL` | string | URL for video lessons |
| `order_index` | `orderIndex` | number | Display order |
| `resource_type` | `resourceType` | string | "PDF" or "ExternalLink" |
| `resource_title` | `resourceTitle` | string | Display name |
| `resource_url` | `resourceURL` | string | Link to resource |

---

## ⚠️ Important Notes

### 1. Sequential API Calls
The API calls **must be sequential**, not parallel:
- Create section → Get sectionId → Create lessons
- Create lesson → Get lessonId → Create resources

### 2. Error Handling
If any step fails, the entire process should stop and rollback if needed.

### 3. Order Index
- Sections are ordered by `orderIndex` (0, 1, 2, ...)
- Lessons within a section are ordered by `orderIndex` (0, 1, 2, ...)

### 4. Response IDs
Backend may return IDs in different formats:
- `response.data.courseId`
- `response.data.id`
- `response.data` (direct value)

We handle all cases:
```typescript
const id = response.data.courseId || response.data.id || response.data;
```

---

## 🧪 Testing

### Test with curl:

```bash
# 1. Create Course
curl -X POST http://localhost:8080/tutor/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "Test Description",
    "categoryID": 2,
    "language": "English",
    "duration": 30,
    "price": 1000000,
    "thumbnailURL": "https://example.com/test.jpg"
  }'

# 2. Create Section (assume courseId = 3)
curl -X POST http://localhost:8080/tutor/courses/sections/3 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Section",
    "description": "Test Section Desc",
    "orderIndex": 0
  }'

# 3. Create Lesson (assume sectionId = 6)
curl -X POST http://localhost:8080/tutor/courses/sections/6/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Lesson",
    "duration": 10,
    "lessonType": "Video",
    "videoURL": "https://example.com/video.mp4",
    "content": "Test content",
    "orderIndex": 0
  }'

# 4. Create Resource (assume lessonId = 1)
curl -X POST http://localhost:8080/tutor/lessons/1/resources \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "PDF",
    "resourceTitle": "Test Resource",
    "resourceURL": "https://example.com/resource.pdf"
  }'
```

---

Updated: 2025-01-09

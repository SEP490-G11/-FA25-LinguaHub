# Create Course Flow - Step by Step API

## 📋 Tổng quan luồng

Luồng tạo khóa học được chia thành 2 bước chính:
1. **Step 1**: Tạo course với thông tin cơ bản → nhận `courseId`
2. **Step 2**: Thêm sections → lessons → resources (từng bước một)

## 🔄 Chi tiết từng bước

### Step 1: Create Course (Basic Info)

**Frontend:**
```typescript
const { courseId } = await courseApi.createCourse({
  title: "English Grammar",
  description: "Learn fundamental English grammar",
  category_id: "1",           // ID từ 1-5 (hardcoded)
  language: "English",        // Tên language (English, Vietnamese, Chinese, Japanese, Korean)
  duration_hours: 40,
  price_vnd: 299000,
  thumbnail: null,
  status: "pending"
});
```

**Categories (Hardcoded - không gọi API):**
```typescript
// src/constants/categories.ts
export const CATEGORIES = [
  { id: '1', name: 'Business English' },
  { id: '2', name: 'IELTS Preparation' },
  { id: '3', name: 'Conversational English' },
  { id: '4', name: 'Grammar & Writing' },
  { id: '5', name: 'Pronunciation & Speaking' },
];
```

**Languages (Hardcoded - không gọi API):**
```typescript
// src/constants/categories.ts
export const LANGUAGES = [
  { id: '1', name: 'English', code: 'en' },
  { id: '2', name: 'Vietnamese', code: 'vi' },
  { id: '3', name: 'Chinese', code: 'zh' },
  { id: '4', name: 'Japanese', code: 'ja' },
  { id: '5', name: 'Korean', code: 'ko' },
];

// Default value khi vào form
formData.language = "English"
```

**API Call:**
```
POST /tutor/courses
Headers: {
  Authorization: "Bearer <token>"  ← Tự động thêm bởi axios interceptor
  Content-Type: "application/json"
}
Body: {
  title: "English Grammar",
  description: "Learn fundamental English grammar",
  category_id: "1",           // ← ID số từ 1-5
  language: "English",        // ← Tên language (string)
  duration_hours: 40,
  price_vnd: 299000,
  status: "pending",
  created_at: "2025-11-07T10:00:00Z"
}
```

**Response:**
```json
{
  "id": "course123",           ← courseId để dùng cho các bước tiếp theo
  "title": "English Grammar",
  "tutor_id": "user123",       ← Backend tự động lấy từ token
  "category_id": "1",
  "language": "English",
  "status": "pending",
  "created_at": "2025-11-07T10:00:00Z"
}
```

**Backend xử lý:**
1. Middleware decode token → lấy `tutor_id` từ token payload
2. Validate dữ liệu course
3. Insert vào database với `tutor_id` từ token
4. Return course object có `id`

---

### Step 2: Add Sections

**Frontend Loop:**
```typescript
for (const section of sections) {
  const { sectionId } = await courseApi.addSection(courseId, {
    title: section.title,
    description: section.description,
    order_index: section.order_index
  });
  
  // Sau đó add lessons cho section này...
}
```

**API Call:**
```
POST /tutor/courses/course123/sections
Headers: {
  Authorization: "Bearer <token>"
}
Body: {
  title: "Introduction",
  description: "Getting started",
  order_index: 0
}
```

**Response:**
```json
{
  "id": "section456",          ← sectionId để add lessons
  "course_id": "course123",
  "title": "Introduction",
  "order_index": 0
}
```

---

### Step 3: Add Lessons

**Frontend Loop:**
```typescript
for (const lesson of section.lessons) {
  const { lessonId } = await courseApi.addLesson(courseId, sectionId, {
    title: lesson.title,
    duration_minutes: lesson.duration_minutes,
    lesson_type: lesson.lesson_type,
    video_url: lesson.video_url,
    content: lesson.content,
    order_index: lesson.order_index
  });
  
  // Sau đó add resources cho lesson này...
}
```

**API Call:**
```
POST /tutor/courses/course123/sections/section456/lessons
Headers: {
  Authorization: "Bearer <token>"
}
Body: {
  title: "Welcome to the course",
  duration_minutes: 10,
  lesson_type: "Video",
  video_url: "https://youtube.com/watch?v=xxx",
  order_index: 0
}
```

**Response:**
```json
{
  "id": "lesson789",           ← lessonId để add resources
  "section_id": "section456",
  "title": "Welcome to the course",
  "lesson_type": "Video",
  "order_index": 0
}
```

---

### Step 4: Add Resources

**Frontend Loop:**
```typescript
if (lesson.resources && lesson.resources.length > 0) {
  for (const resource of lesson.resources) {
    await courseApi.addLessonResource(courseId, sectionId, lessonId, {
      resource_type: resource.resource_type,
      resource_title: resource.resource_title,
      resource_url: resource.resource_url
    });
  }
}
```

**API Call:**
```
POST /tutor/courses/course123/sections/section456/lessons/lesson789/resources
Headers: {
  Authorization: "Bearer <token>"
}
Body: {
  resource_type: "PDF",
  resource_title: "Course Outline",
  resource_url: "https://example.com/outline.pdf"
}
```

**Response:**
```json
{
  "id": "resource101",
  "lesson_id": "lesson789",
  "resource_type": "PDF",
  "resource_title": "Course Outline"
}
```

---

## 🔑 Điểm quan trọng

### 1. Token tự động gửi kèm

File `axiosConfig.ts` đã cấu hình interceptor:
```typescript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token && token.trim() !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

→ Mọi request đều tự động có header `Authorization: Bearer <token>`

### 2. Backend tự động lấy tutor_id từ token

Frontend **KHÔNG** cần gửi `tutor_id`:
```typescript
// ❌ KHÔNG CẦN
{ title: "...", tutor_id: "user123" }

// ✅ CHỈ CẦN
{ title: "...", description: "..." }
```

Backend decode token và tự động gán:
```javascript
// Backend middleware
const tutor_id = req.user.id; // Lấy từ token đã decode

// Backend controller
await db.courses.create({
  ...requestBody,
  tutor_id: tutor_id  // ← Tự động thêm
});
```

### 3. Luồng tuần tự (Sequential)

```
Step 1: Create Course
   ↓ (nhận courseId)
Step 2: Loop sections
   ↓ (nhận sectionId cho mỗi section)
Step 3: Loop lessons trong mỗi section
   ↓ (nhận lessonId cho mỗi lesson)
Step 4: Loop resources trong mỗi lesson
   ↓
Complete!
```

### 4. Error Handling

Nếu bất kỳ bước nào thất bại:
- Catch error
- Hiển thị message cho user
- Có thể rollback hoặc để user retry

```typescript
try {
  const { courseId } = await courseApi.createCourse(data);
  // ... tiếp tục
} catch (error) {
  setError(error.message);
  setIsSubmitting(false);
  // Course đã tạo có thể delete hoặc để draft
}
```

---

## 📝 File quan trọng

1. **`src/queries/course-api.ts`** - Chứa tất cả API functions
2. **`src/pages/CreateCourse/LanguageCourses.tsx`** - Main component xử lý luồng
3. **`src/config/axiosConfig.ts`** - Axios instance với interceptor tự động thêm token

---

## 🧪 Testing

Để test luồng:
1. Đăng nhập với tài khoản Tutor
2. Navigate đến `/tutor/create-courses`
3. Nhập thông tin Step 1 → Click Next
4. Kiểm tra Network tab: `POST /tutor/courses` → nhận courseId
5. Thêm sections/lessons → Click Save
6. Kiểm tra Network tab: Thấy các request POST tuần tự cho sections, lessons, resources
7. Redirect đến `/tutor/courses` sau khi hoàn thành

---

Bây giờ luồng Create Course đã hoàn chỉnh! 🎉

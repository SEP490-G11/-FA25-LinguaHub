# Debug Guide - CreateCourse

## 🔍 Console Logs đã được thêm vào

### Step 1: Course Info Submit

Khi user nhấn nút **"Tiếp theo"** ở Step 1, console sẽ hiển thị:

```
📝 Step 1: Course Info Data
  Form Data: {
    title: "...",
    description: "...",
    categoryID: 2,
    language: "English",
    duration: 30,
    price: 2500000,
    thumbnailURL: "..."
  }
  categoryID type: "number" → 2
  language type: "string" → "English"
  duration type: "number" → 30
  price type: "number" → 2500000
  
🚀 Calling API: POST /tutor/courses
📤 API Request: POST /tutor/courses
  Request Body: { ... }
📥 API Response: { courseId: "3" }
✅ API Response: { success: true, courseId: "3", ... }
```

---

### Step 2: Course Content Submit

Khi user nhấn nút **"Tạo khóa học"** ở Step 2, console sẽ hiển thị:

```
📚 Step 2: Course Content Data
  Course ID: "3"
  Total Sections: 2
  Sections Data: [...]
  
  Section 1: Part 1 - Writing Introduction
    Lessons: 2
    Lesson 1: Lesson 1 - How to Paraphrase (Video)
      Resources: 1
    Lesson 2: Lesson 2 - Essay Structure (Reading)
  
  Section 2: Part 2 - Advanced Techniques
    Lessons: 1
    Lesson 1: Advanced Writing Tips (Video)

🚀 Calling API: saveCourseContentApi
📤 API: Save Course Content
  Course ID: "3"
  Total Sections: 2

  📁 Section 1/2: Part 1 - Writing Introduction
    ✓ Section created with ID: 6
    📄 Lesson 1/2: Lesson 1 - How to Paraphrase
      ✓ Lesson created with ID: 1
      📎 Creating 1 resources...
        ✓ Resource: Paraphrasing Guide
    📄 Lesson 2/2: Lesson 2 - Essay Structure
      ✓ Lesson created with ID: 2

  📁 Section 2/2: Part 2 - Advanced Techniques
    ✓ Section created with ID: 7
    📄 Lesson 1/1: Advanced Writing Tips
      ✓ Lesson created with ID: 3

  ✅ All content saved successfully!

✅ API Response: { success: true, courseId: "3", ... }
```

---

## 🎯 Điều cần kiểm tra

### ✅ Step 1 Submit - Checklist:

1. **categoryID** phải là **number** (không phải string "2")
2. **language** phải là **string** ("English", "Vietnamese", etc.)
3. **duration** và **price** phải là **number**
4. API request body phải match với backend format
5. Response phải trả về `courseId`

### ✅ Step 2 Submit - Checklist:

1. Tất cả sections phải có ít nhất 1 lesson
2. orderIndex phải đúng thứ tự (0, 1, 2, ...)
3. Lesson type phải là "Video" hoặc "Reading"
4. Video lesson phải có `videoURL`
5. Reading lesson phải có `content`
6. API calls phải tuần tự (section → lesson → resource)

---

## 🐛 Common Errors

### Error 1: categoryID is string instead of number
```javascript
// ❌ Wrong
categoryID type: "string" → "2"

// ✅ Correct
categoryID type: "number" → 2
```

**Fix:** Đã được xử lý trong `ui.tsx`:
```typescript
onValueChange={(value) => setValue('categoryID', parseInt(value))}
```

---

### Error 2: Missing required fields
```javascript
// Console shows validation error:
⚠️ Validation Failed: Section "Part 1" phải có ít nhất 1 bài học
```

**Fix:** Add at least 1 lesson to each section before submitting.

---

### Error 3: API response không có courseId
```javascript
📥 API Response: { success: true, data: 3 }
// Expecting: { courseId: 3 }
```

**Fix:** Code đã handle nhiều formats:
```typescript
const courseId = response.data.courseId || response.data.id || response.data;
```

---

## 📊 How to Use Console Logs

### 1. Open Browser DevTools
- Press `F12` or `Ctrl+Shift+I`
- Go to **Console** tab

### 2. Clear Console (optional)
- Click 🚫 icon or press `Ctrl+L`

### 3. Test Step 1
1. Fill in course info form
2. Click **"Tiếp theo"**
3. Check console for:
   - Form data
   - Data types (categoryID should be number)
   - API request/response

### 4. Test Step 2
1. Add sections and lessons
2. Click **"Tạo khóa học"**
3. Check console for:
   - Course structure
   - Sequential API calls (section → lesson → resource)
   - Success/error messages

### 5. Check Network Tab
- Go to **Network** tab
- Filter by **Fetch/XHR**
- Check actual API requests:
  - `POST /tutor/courses`
  - `POST /tutor/courses/sections/3`
  - `POST /tutor/courses/sections/6/lessons`
  - `POST /tutor/lessons/1/resources`

---

## 🎨 Console Output Example

```javascript
// ==================== STEP 1 ====================
📝 Step 1: Course Info Data
  Form Data: Object { title: "IELTS Writing", categoryID: 2, ... }
  categoryID type: number → 2
  language type: string → English
  duration type: number → 30
  price type: number → 2500000

🚀 Calling API: POST /tutor/courses
📤 API Request: POST /tutor/courses
  Request Body: Object { title: "IELTS Writing", categoryID: 2, ... }
📥 API Response: Object { courseId: "3" }
✅ API Response: Object { success: true, courseId: "3" }

// ==================== STEP 2 ====================
📚 Step 2: Course Content Data
  Course ID: 3
  Total Sections: 1
  Sections Data: Array [ {…} ]
  
  Section 1: Part 1 - Introduction
    Lessons: 1
    Lesson 1: Lesson 1 - Basics (Video)

🚀 Calling API: saveCourseContentApi
📤 API: Save Course Content
  Course ID: 3
  Total Sections: 1

  📁 Section 1/1: Part 1 - Introduction
    ✓ Section created with ID: 6
    📄 Lesson 1/1: Lesson 1 - Basics
      ✓ Lesson created with ID: 1

  ✅ All content saved successfully!

✅ API Response: Object { success: true, courseId: "3" }
```

---

## 🔧 Remove Console Logs (Production)

Khi deploy production, có thể:

1. **Comment out** các console.log:
```typescript
// console.log('...');
```

2. **Use environment variable**:
```typescript
if (import.meta.env.DEV) {
  console.log('Debug info');
}
```

3. **Remove manually** từng dòng

---

Updated: 2025-01-09

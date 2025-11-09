# CreateCourse - Cấu trúc mới

## 📁 Cấu trúc file

```
CreateCourse/
├── index.tsx       # Orchestrator chính - quản lý state và logic
├── ui.tsx          # UI components thuần túy (presentational)
├── form.ts         # Zod schemas và React Hook Form setup
├── api.ts          # API calls với axios (self-contained)
└── types.ts        # TypeScript types (self-contained)
```

## 🎯 Nguyên tắc thiết kế

### 1. **Separation of Concerns** (Tách biệt trách nhiệm)
- Mỗi file có một trách nhiệm cụ thể
- Dễ tìm và sửa lỗi
- Dễ test từng phần riêng biệt

### 2. **Self-contained modules** (Module độc lập)
- `api.ts` và `types.ts` KHÔNG import từ bên ngoài folder
- Tất cả dependencies nằm trong folder CreateCourse
- Dễ tái sử dụng và di chuyển

### 3. **Simple and Beginner-friendly** (Đơn giản cho người mới)
- Code rõ ràng, dễ đọc
- Mỗi function làm một việc
- Comments bằng tiếng Việt

## 📄 Chi tiết từng file

### `types.ts` - Định nghĩa types
**Mục đích:** Chứa tất cả TypeScript interfaces/types cho CreateCourse

**Exports:**
- `CourseFormData` - Dữ liệu form khóa học (step 1)
- `LessonData` - Dữ liệu bài học
- `SectionData` - Dữ liệu section
- `CreateCoursePayload` - Payload gửi API
- `CreateCourseResponse` - Response từ API

**Dependencies:** Không có (self-contained)

---

### `api.ts` - API calls
**Mục đích:** Xử lý tất cả HTTP requests

**Exports:**
```typescript
createCourseApi(data: CourseFormData): Promise<CreateCourseResponse>
createSectionApi(courseId: string, section: SectionData): Promise<{ sectionId: string }>
createLessonApi(sectionId: string, lesson: LessonData): Promise<{ lessonId: string }>
createResourceApi(lessonId: string, resource: LessonResource): Promise<void>
saveCourseContentApi(courseId: string, sections: SectionData[]): Promise<CreateCourseResponse>
```

**Dependencies:** 
- `axios` (library)
- `./types` (local)

**Note:** 
- Không dùng React Query hooks
- Pure async functions với try-catch
- Error handling rõ ràng
- API calls are sequential (not parallel)

---

### `form.ts` - Validation và Form setup
**Mục đích:** Zod schemas và React Hook Form configuration

**Exports:**
```typescript
// Schemas
courseInfoSchema: z.ZodObject
lessonSchema: z.ZodObject

// Types từ schemas
CourseInfoFormValues: z.infer<typeof courseInfoSchema>
LessonFormValues: z.infer<typeof lessonSchema>

// Hook factories
useCourseInfoForm(defaultValues?): UseFormReturn<CourseInfoFormValues>
useLessonForm(defaultValues?): UseFormReturn<LessonFormValues>

// Helpers
validateCourseContent(sections): { valid: boolean; error?: string }
```

**Dependencies:**
- `react-hook-form`
- `zod` + `@hookform/resolvers/zod`
- `./types` (local)

---

### `ui.tsx` - Presentational Components
**Mục đích:** Các component UI thuần túy, nhận props và render

**Exports:**
```typescript
CourseInfoUI        // Step 1 form UI
CourseContentUI     // Step 2 content management UI
SectionFormDialog   // Dialog thêm/sửa section
LessonFormDialog    // Dialog thêm/sửa lesson
```

**Props pattern:**
- Nhận data qua props
- Nhận callbacks để gọi lại parent
- Không chứa business logic
- Không gọi API trực tiếp

**Dependencies:**
- Shadcn UI components
- `./form` (types)
- `./types` (types)
- `@/constants/categories` (data)

---

### `index.tsx` - Main Orchestrator
**Mục đích:** Điều phối toàn bộ flow, quản lý state

**Responsibilities:**
- Quản lý state (step, sections, dialogs, etc.)
- Xử lý user actions (add, edit, delete, move)
- Gọi API functions từ `api.ts`
- Hiển thị UI components từ `ui.tsx`
- Quản lý navigation và toasts

**Structure:**
```typescript
export default function CreateCourse() {
  // 1. State declarations
  // 2. Step 1 handlers
  // 3. Step 2 handlers - Sections
  // 4. Step 2 handlers - Lessons
  // 5. Submit handlers
  // 6. Render
}
```

**Dependencies:** Tất cả các file local khác

---

## 🔄 Data Flow

### Step 1: Course Info
```
User Input → CourseInfoUI → handleStep1Submit → createCourseApi → Success → Step 2
```

### Step 2: Course Content
```
User Action → Handler in index.tsx → Update sections state → CourseContentUI re-renders
```

### Final Submit
```
handleStep2Save → validateCourseContent → saveCourseContentApi → Success → Navigate
```

---

## 🚀 So với cấu trúc cũ

### ❌ Cũ (course-info.tsx - 394 lines)
- Mixed responsibilities (UI + validation + state + logic)
- Manual validation với touched/errors state
- Khó đọc, khó maintain
- Duplicate code

### ✅ Mới (tách thành 5 files)
- Clear separation of concerns
- Declarative validation với Zod
- Dễ đọc, dễ test, dễ maintain
- Reusable components và functions

---

## 💡 Best Practices

1. **Khi thêm field mới:**
   - Thêm vào `types.ts` → `form.ts` (schema) → `ui.tsx` (input)

2. **Khi thêm API endpoint mới:**
   - Chỉ cần sửa `api.ts`
   - Không cần touch UI hay validation

3. **Khi thay đổi UI:**
   - Chỉ sửa `ui.tsx`
   - Logic và validation không đổi

4. **Debugging:**
   - API error → Check `api.ts`
   - Validation error → Check `form.ts`
   - UI error → Check `ui.tsx`
   - State error → Check `index.tsx`

---

## 📝 Example: Thêm field "Level" vào course

### 1. Update `types.ts`
```typescript
export interface CourseFormData {
  // ... existing fields
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
}
```

### 2. Update `form.ts`
```typescript
export const courseInfoSchema = z.object({
  // ... existing fields
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
});
```

### 3. Update `ui.tsx`
```tsx
<Select
  value={watch('level')}
  onValueChange={(value) => setValue('level', value)}
>
  <SelectTrigger><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="Beginner">Người mới</SelectItem>
    <SelectItem value="Intermediate">Trung cấp</SelectItem>
    <SelectItem value="Advanced">Nâng cao</SelectItem>
  </SelectContent>
</Select>
```

### 4. Update `api.ts` (nếu backend cần)
```typescript
const payload = {
  ...data,
  level: data.level || 'Beginner', // default
};
```

---

## 🎓 Học từ cấu trúc này

- **Separation of Concerns**: Mỗi file một việc
- **Single Responsibility**: Mỗi function một trách nhiệm
- **DRY**: Don't Repeat Yourself
- **Self-contained**: Module độc lập, dễ di chuyển
- **Type Safety**: TypeScript đầy đủ
- **Declarative**: Validation với Zod thay vì manual

---

Được tạo bởi: AI Assistant  
Ngày: 2025-01-09

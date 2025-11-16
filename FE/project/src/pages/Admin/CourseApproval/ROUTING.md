# Routing Configuration

## 📍 Routes cần thêm

Thêm route sau vào router configuration của bạn:

```tsx
import CourseApprovalPage from '@/pages/Admin/CourseApproval';
import CourseDetailPage from '@/pages/Admin/CourseApproval/CourseDetailPage';

// In your router
<Route path="/admin/course-approval" element={<CourseApprovalPage />} />
<Route path="/admin/course-approval/:courseId" element={<CourseDetailPage />} />
```

## 🔗 URL Structure

### List Page
```
/admin/course-approval
```
Hiển thị danh sách tất cả courses pending

### Detail Page (Live Course)
```
/admin/course-approval/123
```
Hiển thị chi tiết course với ID = 123 (live course)

### Detail Page (Draft Course)
```
/admin/course-approval/456?isDraft=true
```
Hiển thị chi tiết draft với ID = 456

## 🎯 Navigation Flow

1. **User vào list page** → `/admin/course-approval`
2. **Click "Xem chi tiết & Duyệt"** → Navigate to detail page
3. **Approve/Reject** → Navigate back to list page

## 📝 Example Router Setup

### React Router v6

```tsx
// App.tsx or routes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CourseApprovalPage from '@/pages/Admin/CourseApproval';
import CourseDetailPage from '@/pages/Admin/CourseApproval/CourseDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes */}
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Route path="course-approval" element={<CourseApprovalPage />} />
          <Route path="course-approval/:courseId" element={<CourseDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### With Layout

```tsx
<Route path="/admin" element={<AdminLayout />}>
  <Route path="course-approval" element={<CourseApprovalPage />} />
  <Route path="course-approval/:courseId" element={<CourseDetailPage />} />
</Route>
```

## 🔒 Protected Routes

Nếu cần authentication:

```tsx
<Route path="/admin" element={<ProtectedRoute role="Admin" />}>
  <Route path="course-approval" element={<CourseApprovalPage />} />
  <Route path="course-approval/:courseId" element={<CourseDetailPage />} />
</Route>
```

## ✅ Checklist

- [ ] Thêm route `/admin/course-approval` cho list page
- [ ] Thêm route `/admin/course-approval/:courseId` cho detail page
- [ ] Test navigation từ list → detail
- [ ] Test navigation từ detail → list (sau approve/reject)
- [ ] Test với cả live course và draft course
- [ ] Verify URL params (isDraft=true cho drafts)

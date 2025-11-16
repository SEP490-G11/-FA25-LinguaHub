# CourseApproval - Changelog

## ✅ Đã hoàn thành

### 1. Xóa code cũ và tạo lại từ đầu
- ✅ Xóa toàn bộ thư mục CourseApproval cũ
- ✅ Tạo lại với cấu trúc thống nhất với TutorPages

### 2. Cập nhật API để match với backend
- ✅ **Endpoint chính xác:**
  - Live courses: `/admin/courses/by-status?status=Pending`
  - Draft courses: `/admin/courses/drafts?status=PENDING_REVIEW`
  - Detail: `/admin/courses/{id}/detail` hoặc `/admin/courses/drafts/{id}/detail`
  - Approve: `/admin/courses/{id}/approve` (POST) hoặc `/admin/courses/drafts/{id}/approve`
  - Reject: `/admin/courses/{id}/reject` (POST) hoặc `/admin/courses/drafts/{id}/reject`

- ✅ **Status values đúng:**
  - Course Live: `Draft, Pending, Approved, Rejected, Disabled`
  - Course Draft: `EDITING, PENDING_REVIEW, REJECTED`

- ✅ **Request body đúng:**
  - Approve/Reject sử dụng `{ note: string }` thay vì `adminNotes` hoặc `rejectionReason`

### 3. Hỗ trợ cả Live Course và Draft Course
- ✅ Fetch cả 2 loại courses (live pending + draft pending)
- ✅ Thêm field `isDraft` để phân biệt
- ✅ Badge hiển thị "Draft" cho draft courses
- ✅ API calls tự động chọn endpoint đúng dựa trên `isDraft`

### 4. Cấu trúc thống nhất
- ✅ Types match với TutorPages
- ✅ Field names: `section`, `thumbnailURL`, `categoryID`, etc.
- ✅ Có objectives support
- ✅ Có resources trong lessons

## 🔧 Cấu trúc API

### getPendingCourses()
```typescript
// Fetch cả live courses và draft courses
const [liveCoursesResponse, draftCoursesResponse] = await Promise.all([
  axios.get('/admin/courses/by-status', { params: { status: 'Pending' } }),
  axios.get('/admin/courses/drafts', { params: { status: 'PENDING_REVIEW' } }),
]);

// Combine và map sang PendingCourse format
// Apply filters (search, category)
// Apply pagination
```

### getCourseDetail(courseId, isDraft)
```typescript
const endpoint = isDraft
  ? `/admin/courses/drafts/${courseId}/detail`
  : `/admin/courses/${courseId}/detail`;
```

### approveCourse(courseId, isDraft, adminNotes)
```typescript
const endpoint = isDraft
  ? `/admin/courses/drafts/${courseId}/approve`
  : `/admin/courses/${courseId}/approve`;

await axios.post(endpoint, { note: adminNotes });
```

### rejectCourse(courseId, isDraft, rejectionReason)
```typescript
const endpoint = isDraft
  ? `/admin/courses/drafts/${courseId}/reject`
  : `/admin/courses/${courseId}/reject`;

await axios.post(endpoint, { note: rejectionReason });
```

## 📊 Response Mapping

### Backend Response → Frontend Type

**Live Course:**
```java
AdminCourseResponse {
  courseID, title, shortDescription, description,
  requirement, level, categoryID, categoryName,
  language, duration, price, thumbnailURL,
  tutorID, tutorName, tutorEmail,
  createdAt, updatedAt
}
```

**Draft Course:**
```java
AdminCourseDraftResponse {
  draftID, title, shortDescription, description,
  requirement, level, categoryID, categoryName,
  language, duration, price, thumbnailURL,
  tutorID, tutorName, tutorEmail,
  createdAt, updatedAt
}
```

**Mapped to:**
```typescript
PendingCourse {
  id: courseID || draftID,
  // ... other fields
  isDraft: boolean
}
```

## 🎯 Tính năng

1. **Hiển thị tất cả courses chờ duyệt** (cả live và draft)
2. **Tìm kiếm** theo tên khóa học hoặc giảng viên
3. **Lọc** theo danh mục
4. **Xem chi tiết** đầy đủ (sections, lessons, resources, objectives)
5. **Phê duyệt** với ghi chú tùy chọn
6. **Từ chối** với lý do bắt buộc
7. **Phân trang** client-side
8. **Badge phân biệt** Draft vs Live course

## 🚀 Test

Để test, cần:
1. Có ít nhất 1 course với status `Pending` trong database
2. Hoặc có 1 course draft với status `PENDING_REVIEW`
3. Backend đang chạy ở `http://localhost:8080`
4. User đã login với role `Admin`

## 📝 Notes

- Client-side pagination (fetch tất cả, filter và paginate ở frontend)
- Có thể chuyển sang server-side pagination nếu số lượng courses lớn
- Toast notifications cho user feedback
- Error handling đầy đủ
- Loading states cho UX tốt hơn

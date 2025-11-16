# Course Approval Page

## 📋 Tổng quan

Trang quản lý phê duyệt khóa học cho Admin. Được xây dựng lại từ đầu để thống nhất với cấu trúc TutorPages.

## 🎯 Tính năng

- ✅ Hiển thị danh sách khóa học chờ phê duyệt
- ✅ Tìm kiếm theo tên khóa học hoặc giảng viên
- ✅ Lọc theo danh mục
- ✅ **Trang chi tiết riêng** (không phải modal) để xem đầy đủ nội dung
- ✅ Xem chi tiết khóa học (sections, lessons, resources, objectives)
- ✅ Phê duyệt khóa học với ghi chú
- ✅ Từ chối khóa học với lý do
- ✅ Phân trang
- ✅ Responsive design
- ✅ Hỗ trợ cả Live Course và Draft Course

## 🏗️ Cấu trúc

```
CourseApproval/
├── index.tsx                 # List page - danh sách courses
├── CourseDetailPage.tsx      # Detail page - chi tiết & duyệt course
├── api.ts                    # API calls
├── types.ts                  # TypeScript interfaces
├── README.md                 # Documentation
├── ROUTING.md                # Router configuration guide
├── API_MAPPING.md            # Backend DTO mapping guide
├── CHANGELOG.md              # Change history
└── components/
    ├── index.ts              # Export all components
    ├── filters.tsx           # Search & filter component
    ├── course-card.tsx       # Course card display
    ├── pagination.tsx        # Pagination component
    └── course-detail-modal.tsx # (Deprecated - không dùng nữa)
```

## 📦 Types

### PendingCourse
Thông tin cơ bản của khóa học chờ duyệt:
- id, title, description, shortDescription
- categoryID, categoryName
- tutorID, tutorName, tutorEmail
- level, language, duration, price
- thumbnailURL, status
- createdAt, updatedAt

### CourseDetail
Extends PendingCourse với:
- section[] - Danh sách chương học
- objectives[] - Mục tiêu học tập
- adminNotes - Ghi chú từ admin
- rejectionReason - Lý do từ chối

### Section
- sectionID, title, description, orderIndex
- lessons[] - Danh sách bài học

### Lesson
- lessonID, title, duration, lessonType
- videoURL, content, orderIndex
- resources[] - Tài liệu học tập

### Resource
- resourceID, resourceType, resourceTitle, resourceURL

### Objective
- objectiveID, objectiveText, orderIndex

## 🔌 API Endpoints

### GET /admin/courses
Lấy danh sách khóa học chờ duyệt
- Query params: page, limit, status, search, categoryID

### GET /admin/courses/:id
Lấy chi tiết khóa học

### PUT /admin/courses/:id/approve
Phê duyệt khóa học
- Body: { adminNotes?: string }

### PUT /admin/courses/:id/reject
Từ chối khóa học
- Body: { rejectionReason: string }

## 🎨 Components

### Filters
Tìm kiếm và lọc khóa học theo:
- Tên khóa học / giảng viên
- Danh mục

### CourseCard
Hiển thị thông tin tóm tắt:
- Thumbnail
- Title, category, level
- Tutor info
- Duration, price
- Created date
- View details button

### CourseDetailModal
Modal hiển thị đầy đủ thông tin:
- Basic info & stats
- Description & requirements
- Learning objectives
- Course content (sections → lessons → resources)
- Admin actions (approve/reject)

### Pagination
Phân trang với:
- Page numbers
- Previous/Next buttons
- Total items display

## 🔄 Thống nhất với TutorPages

### Cấu trúc dữ liệu
- ✅ Sử dụng `section` thay vì `sections`
- ✅ Có `objectives[]`
- ✅ Có `resources[]` trong lessons
- ✅ Field names match: `thumbnailURL`, `categoryID`, etc.

### Status values
- `'Pending'` - Chờ duyệt
- `'Approved'` - Đã duyệt
- `'Rejected'` - Từ chối
- `'Draft'` - Nháp

### Types consistency
Tất cả types match với:
- `TutorPages/CreateCourse`
- `TutorPages/EditCourse`
- `TutorPages/CourseList`

## 🚀 Sử dụng

```tsx
import CourseApprovalPage from '@/pages/Admin/CourseApproval';
import CourseDetailPage from '@/pages/Admin/CourseApproval/CourseDetailPage';

// In your router
<Route path="/admin/course-approval" element={<CourseApprovalPage />} />
<Route path="/admin/course-approval/:courseId" element={<CourseDetailPage />} />
```

Xem chi tiết trong [ROUTING.md](./ROUTING.md)

## 📝 Notes

- API endpoints có thể cần điều chỉnh theo backend thực tế
- Toast notifications sử dụng `useToast` hook
- Responsive design với Tailwind CSS
- Icons từ `lucide-react`
- UI components từ `@/components/ui`

## 🔧 Cần cập nhật

Nếu backend API khác với spec hiện tại, cần update:
1. `api.ts` - Điều chỉnh endpoints và response mapping
2. `types.ts` - Cập nhật interfaces nếu cần
3. Components - Điều chỉnh hiển thị dữ liệu

## ✅ Đã hoàn thành

- [x] Xóa code cũ
- [x] Tạo unified types
- [x] Implement API layer
- [x] Tạo components
- [x] Main page với full features
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Toast notifications

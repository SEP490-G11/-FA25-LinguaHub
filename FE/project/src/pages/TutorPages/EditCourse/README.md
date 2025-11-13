# 📚 Trang Edit Khóa Học - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

Trang Edit Khóa Học (`/tutor/courses/:courseId/edit`) cho phép giáo viên chỉnh sửa thông tin khóa học, quản lý cấu trúc nội dung (chương, bài học, tài liệu) và gửi khóa học để phê duyệt.

## 📂 Cấu Trúc File

```
src/pages/TutorPages/EditCourse/
├── boxchat.tsx                          # Main page component
├── types.ts                           # TypeScript interfaces
├── edit-course-api.ts                 # API functions
└── components/
    ├── index.ts                       # Barrel export
    ├── edit-course-info.tsx           # Step 1: Edit course info
    └── edit-course-structure.tsx      # Step 2: Edit content structure
```

## 🔄 Quy Trình Làm Việc

### Bước 1: Chỉnh Sửa Thông Tin Khóa Học

Người dùng có thể chỉnh sửa:
- **Tên khóa học**: Tiêu đề khóa học
- **Mô tả**: Mô tả chi tiết về khóa học
- **Thời lượng**: Số giờ học (tính bằng giờ)
- **Giá**: Giá khóa học (tính bằng VND)
- **Ngôn ngữ giảng dạy**: Chọn từ danh sách
- **URL hình ảnh**: Thumbnail khóa học (có preview)
- **Danh mục**: Hiển thị chỉ đọc

**API được sử dụng:**
- `GET /tutor/courses/{courseId}` - Lấy thông tin khóa học
- `PUT /tutor/courses/{courseId}` - Cập nhật thông tin

### Bước 2: Quản Lý Nội Dung Khóa Học

Người dùng có thể:

#### 📖 Quản Lý Chương (Sections)
- **Xem danh sách**: Tất cả chương được hiển thị dưới dạng card có thể mở rộng
- **Chỉnh sửa**: Thay đổi tên và mô tả chương
- **Xóa**: Xóa chương (không thể khôi phục)

**API được sử dụng:**
- `PUT /tutor/courses/sections/{sectionID}` - Cập nhật chương
- `DELETE /tutor/courses/sections/{sectionID}` - Xóa chương

#### 🎥 Quản Lý Bài Học (Lessons)
- **Xem danh sách**: Tất cả bài học trong mỗi chương
- **Chỉnh sửa**: Thay đổi:
  - Tên bài học
  - Thời lượng (phút)
  - Loại bài học (Video/Reading)
  - URL video
  - Nội dung bài học
- **Xóa**: Xóa bài học

**API được sử dụng:**
- `PUT /tutor/courses/sections/lessons/{lessonId}` - Cập nhật bài học
- `DELETE /tutor/courses/sections/lessons/{lessonId}` - Xóa bài học

#### 📎 Quản Lý Tài Liệu (Resources)
- **Xem danh sách**: Tất cả tài liệu trong mỗi bài học
- **Chỉnh sửa**: Thay đổi:
  - Loại tài liệu (PDF/Video/ExternalLink/Document)
  - Tên tài liệu
  - URL tài liệu
- **Xóa**: Xóa tài liệu

**API được sử dụng:**
- `PUT /tutor/resources/{resourceId}` - Cập nhật tài liệu
- `DELETE /tutor/resources/{resourceId}` - Xóa tài liệu

### Bước 3: Gửi Khóa Học Để Phê Duyệt

Khi nhấn nút "Hoàn thành khóa học":
- Gửi yêu cầu `PUT /tutor/courses/{courseId}/submit`
- Hiển thị modal thành công
- Chuyển hướng về danh sách khóa học

## 🎨 Giao Diện & UX

### Sự Mở Rộng/Thu Gọn (Expand/Collapse)
- Chương mở rộng theo mặc định (chương đầu tiên)
- Bài học và tài liệu thu gọn theo mặc định
- Người dùng có thể tùy chỉnh bằng cách bấm vào chevron icon

### Xác Nhận Xóa
- Dialog xác nhận xuất hiện trước khi xóa
- Có nút Hủy để thoát
- Thông báo rõ ràng về hành động sẽ xóa

### Biểu Thị Tiến Trình
- Step indicator cho hai bước
- Step 1: Thông tin khóa học
- Step 2: Nội dung khóa học
- Đánh dấu hoàn thành với checkmark

### Thông Báo (Toast)
- Thành công: Hiển thị khi cập nhật thành công
- Lỗi: Hiển thị khi có lỗi
- Thông báo rõ ràng cho từng hành động

## 🔌 API Endpoints

| Phương Thức | Endpoint | Chức Năng |
|---|---|---|
| GET | `/tutor/courses/{courseId}` | Lấy thông tin khóa học |
| PUT | `/tutor/courses/{courseId}` | Cập nhật thông tin khóa học |
| PUT | `/tutor/courses/sections/{sectionID}` | Cập nhật chương |
| DELETE | `/tutor/courses/sections/{sectionID}` | Xóa chương |
| PUT | `/tutor/courses/sections/lessons/{lessonId}` | Cập nhật bài học |
| DELETE | `/tutor/courses/sections/lessons/{lessonId}` | Xóa bài học |
| PUT | `/tutor/resources/{resourceId}` | Cập nhật tài liệu |
| DELETE | `/tutor/resources/{resourceId}` | Xóa tài liệu |
| PUT | `/tutor/courses/{courseId}/submit` | Gửi khóa học để phê duyệt |

## 💾 State Management

### Main States
- `course`: Lưu trữ thông tin khóa học hiện tại
- `currentStep`: Bước hiện tại (1 hoặc 2)
- `isLoading`: Trạng thái loading
- `isSaving`: Trạng thái đang lưu
- `error`: Thông báo lỗi
- `showSuccessModal`: Hiển thị modal thành công

### Expand/Collapse States
- `expandedSections`: Set các section mở rộng
- `expandedLessons`: Map các lesson mở rộng

### Edit Dialog States
- `editingSectionIndex`: Chương đang chỉnh sửa
- `editingLessonKey`: Bài học đang chỉnh sửa
- `editingResourceKey`: Tài liệu đang chỉnh sửa
- `editingSectionData`: Dữ liệu chương
- `editingLessonData`: Dữ liệu bài học
- `editingResourceData`: Dữ liệu tài liệu

### Delete Confirmation State
- `deleteConfirm`: Thông tin xác nhận xóa

## ✅ Validation

### Chỉnh Sửa Thông Tin Khóa Học
- Tên khóa học: Bắt buộc, không được rỗng
- Mô tả: Bắt buộc, không được rỗng
- Thời lượng: Phải > 0
- Giá: Không được âm
- Ngôn ngữ: Bắt buộc chọn
- URL hình ảnh: Bắt buộc, phải hợp lệ

### Chỉnh Sửa Chương
- Tên chương: Bắt buộc, không được rỗng

### Chỉnh Sửa Bài Học
- Tên bài học: Bắt buộc, không được rỗng
- Thời lượng: Phải >= 1

### Chỉnh Sửa Tài Liệu
- Tên tài liệu: Bắt buộc, không được rỗng

## 🌐 Route

```
/tutor/courses/:courseId/edit
```

Ví dụ:
- `/tutor/courses/1/edit` - Chỉnh sửa khóa học có ID 1

## 📦 Dependencies

- `react`: Framework chính
- `react-router-dom`: Điều hướng
- `@/components/ui/*`: UI Components (Button, Input, Dialog, etc.)
- `lucide-react`: Icons
- `axios`: HTTP client (thông qua `axiosInstance`)

## 🚀 Cách Sử Dụng

### Từ Component Khác
```tsx
import EditCourse from '@/pages/TutorPages/EditCourse';

// Sử dụng trong Route
<Route path="courses/:courseId/edit" element={<EditCourse />} />

// Hoặc điều hướng từ component
navigate(`/tutor/courses/${courseId}/edit`);
```

## 🔐 Xác Thực

Tất cả API requests sử dụng `axiosInstance` với token xác thực từ header (được cấu hình sẵn).

## 📝 Ghi Chú

- Chỉ có thể chỉnh sửa khóa học của bản thân
- Xóa không thể khôi phục
- Các thay đổi được lưu ngay khi nhấn Save
- Gửi khóa học để phê duyệt là bước cuối cùng (không thể chỉnh sửa sau khi gửi)
- Form validation được thực hiện trước khi gửi
- Loading spinner hiển thị khi tải dữ liệu
- Error banner hiển thị khi có lỗi

## 🎓 Ví Dụ Dữ Liệu

### CourseDetail Response
```json
{
  "id": 1,
  "title": "Advanced English Business Communication",
  "description": "Comprehensive course for professionals",
  "duration": 40,
  "price": 750000,
  "language": "English",
  "thumbnailURL": "https://example.com/image.jpg",
  "categoryName": "TOEIC",
  "status": "Approved",
  "section": [
    {
      "sectionID": 1,
      "courseID": 1,
      "title": "Business Email Writing",
      "description": "Learn professional email communication",
      "orderIndex": 1,
      "lessons": [
        {
          "lessonID": 1,
          "title": "Email Structure and Format",
          "duration": 30,
          "lessonType": "Video",
          "videoURL": "https://example.com/video.mp4",
          "content": "Lesson content...",
          "orderIndex": 1,
          "createdAt": "2025-11-10T20:02:02",
          "resources": [
            {
              "resourceID": 1,
              "resourceType": "PDF",
              "resourceTitle": "Email Templates",
              "resourceURL": "https://example.com/templates.pdf",
              "uploadedAt": "2025-11-10T20:02:02"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🐛 Troubleshooting

### Không tải được khóa học
- Kiểm tra courseId trong URL
- Kiểm tra token xác thực
- Kiểm tra backend API

### Không thể lưu thay đổi
- Kiểm tra validation form
- Kiểm tra kết nối mạng
- Kiểm tra response từ API

### Modal xóa không xuất hiện
- Đảm bảo bạn nhấp vào nút Trash icon
- Kiểm tra console để xem lỗi

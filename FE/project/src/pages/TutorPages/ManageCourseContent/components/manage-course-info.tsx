import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CourseDetail } from '../types';

interface ManageCourseInfoProps {
  course: CourseDetail;
  onSave: (data: Partial<CourseDetail>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ManageCourseInfo({
  course,
  onSave,
  onCancel,
  isSubmitting,
}: ManageCourseInfoProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    duration: course.duration,
    price: course.price,
    language: course.language,
    thumbnailURL: course.thumbnailURL,
    categoryName: course.categoryName,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tên khóa học');
      return;
    }
    if (!formData.description.trim()) {
      alert('Vui lòng nhập mô tả khóa học');
      return;
    }
    if (formData.duration <= 0) {
      alert('Thời lượng phải lớn hơn 0');
      return;
    }
    if (formData.price < 0) {
      alert('Giá không được âm');
      return;
    }
    if (!formData.language.trim()) {
      alert('Vui lòng chọn ngôn ngữ');
      return;
    }
    if (!formData.thumbnailURL.trim()) {
      alert('Vui lòng nhập URL hình ảnh');
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Title */}
      <div>
        <Label htmlFor="title">Tên khóa học *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., IELTS Masterclass"
          disabled={isSubmitting}
        />
      </div>

      {/* Course Description */}
      <div>
        <Label htmlFor="description">Mô tả khóa học *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả chi tiết về khóa học của bạn..."
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      {/* Duration and Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Thời lượng (giờ) *</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            step="0.5"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 10"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="price">Giá (VND) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1000"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 199000"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <Label htmlFor="language">Ngôn ngữ *</Label>
        <Input
          id="language"
          name="language"
          value={formData.language}
          onChange={handleChange}
          placeholder="e.g., English"
          disabled={isSubmitting}
        />
      </div>

      {/* Thumbnail URL */}
      <div>
        <Label htmlFor="thumbnailURL">URL Hình ảnh đại diện *</Label>
        <Input
          id="thumbnailURL"
          name="thumbnailURL"
          value={formData.thumbnailURL}
          onChange={handleChange}
          placeholder="https://example.com/thumbnail.jpg"
          disabled={isSubmitting}
        />
      </div>

      {/* Thumbnail Preview */}
      {formData.thumbnailURL && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Xem trước hình ảnh:</p>
          <img
            src={formData.thumbnailURL}
            alt="Thumbnail preview"
            className="w-full h-40 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />
        </div>
      )}

      {/* Category (Read-only) */}
      <div>
        <Label htmlFor="categoryName">Danh mục</Label>
        <Input
          id="categoryName"
          name="categoryName"
          value={formData.categoryName}
          disabled
          className="bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Danh mục không thể thay đổi. Liên hệ quản trị viên nếu cần hỗ trợ.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Tiếp tục'}
        </Button>
      </div>
    </form>
  );
}

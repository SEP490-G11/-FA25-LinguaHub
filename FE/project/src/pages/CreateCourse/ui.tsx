// UI Components cho CreateCourse
// Các components presentational thuần túy, nhận props và hiển thị

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Video,
  FileText,
  X,
} from 'lucide-react';
import { CATEGORIES, LANGUAGES } from '@/constants/categories';
import type { CourseInfoFormValues, LessonFormValues } from './form';
import type { SectionData } from './types';

// ============ STEP 1: Course Info UI ============
interface CourseInfoUIProps {
  form: UseFormReturn<CourseInfoFormValues>;
  thumbnailPreview: string | null;
  onThumbnailChange: (url: string) => void;
  onRemoveThumbnail: () => void;
  onSubmit: (data: CourseInfoFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CourseInfoUI({
  form,
  thumbnailPreview,
  onThumbnailChange,
  onRemoveThumbnail,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CourseInfoUIProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">
          Tiêu đề khóa học <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="VD: Tiếng Anh cho người mới bắt đầu"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">
          Mô tả <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Mô tả khóa học của bạn..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Category & Language - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>
            Danh mục <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('categoryID')?.toString()}
            onValueChange={(value) => setValue('categoryID', parseInt(value), { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryID && (
            <p className="text-sm text-red-500 mt-1">{errors.categoryID.message}</p>
          )}
        </div>

        <div>
          <Label>
            Ngôn ngữ <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch('language')}
            onValueChange={(value) => setValue('language', value, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn ngôn ngữ" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.name} value={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && (
            <p className="text-sm text-red-500 mt-1">{errors.language.message}</p>
          )}
        </div>
      </div>

      {/* Duration & Price - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">
            Thời lượng (giờ) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            type="number"
            {...register('duration', { valueAsNumber: true })}
            placeholder="VD: 40"
          />
          {errors.duration && (
            <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">
            Giá (VNĐ) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            placeholder="VD: 500000"
          />
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>
      </div>

      {/* Thumbnail URL */}
      <div>
        <Label htmlFor="thumbnailURL">Ảnh đại diện (URL)</Label>
        <div className="flex gap-2">
          <Input
            id="thumbnailURL"
            {...register('thumbnailURL')}
            onChange={(e) => onThumbnailChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          {thumbnailPreview && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onRemoveThumbnail}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {errors.thumbnailURL && (
          <p className="text-sm text-red-500 mt-1">{errors.thumbnailURL.message}</p>
        )}
        {thumbnailPreview && (
          <div className="mt-2">
            <img
              src={thumbnailPreview}
              alt="Preview"
              className="w-full max-w-xs rounded-lg border"
              onError={() => onRemoveThumbnail()}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : 'Tiếp theo'}
        </Button>
      </div>
    </form>
  );
}

// ============ STEP 2: Course Content UI ============
interface CourseContentUIProps {
  sections: SectionData[];
  expandedSections: Set<number>;
  onToggleSection: (index: number) => void;
  onAddSection: () => void;
  onEditSection: (index: number) => void;
  onDeleteSection: (index: number) => void;
  onMoveSectionUp: (index: number) => void;
  onMoveSectionDown: (index: number) => void;
  onAddLesson: (sectionIndex: number) => void;
  onEditLesson: (sectionIndex: number, lessonIndex: number) => void;
  onDeleteLesson: (sectionIndex: number, lessonIndex: number) => void;
  onMoveLessonUp: (sectionIndex: number, lessonIndex: number) => void;
  onMoveLessonDown: (sectionIndex: number, lessonIndex: number) => void;
  onSave: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function CourseContentUI({
  sections,
  expandedSections,
  onToggleSection,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onMoveSectionUp,
  onMoveSectionDown,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLessonUp,
  onMoveLessonDown,
  onSave,
  onBack,
  isSubmitting = false,
}: CourseContentUIProps) {
  return (
    <div className="space-y-6">
      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border rounded-lg">
            {/* Section Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleSection(sectionIndex)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.has(sectionIndex) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {section.lessons.length} bài học
                  </p>
                </div>
              </div>

              {/* Section Actions */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveSectionUp(sectionIndex)}
                  disabled={sectionIndex === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveSectionDown(sectionIndex)}
                  disabled={sectionIndex === sections.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditSection(sectionIndex)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSection(sectionIndex)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            {/* Lessons List */}
            {expandedSections.has(sectionIndex) && (
              <div className="p-4 space-y-2">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lessonIndex}
                    className="flex items-center justify-between p-3 bg-white border rounded"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {lesson.lesson_type === 'Video' ? (
                        <Video className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-xs text-gray-500">
                          {lesson.duration_minutes} phút
                        </p>
                      </div>
                    </div>

                    {/* Lesson Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveLessonUp(sectionIndex, lessonIndex)}
                        disabled={lessonIndex === 0}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveLessonDown(sectionIndex, lessonIndex)}
                        disabled={lessonIndex === section.lessons.length - 1}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditLesson(sectionIndex, lessonIndex)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteLesson(sectionIndex, lessonIndex)}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add Lesson Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddLesson(sectionIndex)}
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài học
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Section Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddSection}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Thêm Section
      </Button>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button onClick={onSave} disabled={isSubmitting || sections.length === 0}>
          {isSubmitting ? 'Đang lưu...' : 'Tạo khóa học'}
        </Button>
      </div>
    </div>
  );
}

// ============ Section Form Dialog ============
interface SectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => void;
  initialData?: { title: string; description: string };
}

export function SectionFormDialog({
  open,
  onClose,
  onSave,
  initialData,
}: SectionFormDialogProps) {
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [description, setDescription] = React.useState(initialData?.description || '');

  React.useEffect(() => {
    if (open) {
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
    }
  }, [open, initialData]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title, description });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Chỉnh sửa Section' : 'Thêm Section mới'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="section-title">Tiêu đề Section *</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giới thiệu"
            />
          </div>
          <div>
            <Label htmlFor="section-description">Mô tả</Label>
            <Textarea
              id="section-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn gọn..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Lesson Form Dialog ============
interface LessonFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LessonFormValues) => void;
  form: UseFormReturn<LessonFormValues>;
}

export function LessonFormDialog({
  open,
  onClose,
  onSave,
  form,
}: LessonFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const lessonType = watch('lesson_type');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm bài học mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="lesson-title">Tiêu đề bài học *</Label>
            <Input
              id="lesson-title"
              {...register('title')}
              placeholder="VD: Bài 1: Giới thiệu"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lesson-duration">Thời lượng (phút) *</Label>
              <Input
                id="lesson-duration"
                type="number"
                {...register('duration_minutes', { valueAsNumber: true })}
                placeholder="VD: 30"
              />
              {errors.duration_minutes && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.duration_minutes.message}
                </p>
              )}
            </div>

            <div>
              <Label>Loại bài học *</Label>
              <Select
                value={lessonType}
                onValueChange={(value: 'Video' | 'Reading') =>
                  setValue('lesson_type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {lessonType === 'Video' && (
            <div>
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                {...register('video_url')}
                placeholder="https://youtube.com/..."
              />
              {errors.video_url && (
                <p className="text-sm text-red-500 mt-1">{errors.video_url.message}</p>
              )}
            </div>
          )}

          {lessonType === 'Reading' && (
            <div>
              <Label htmlFor="lesson-content">Nội dung</Label>
              <Textarea
                id="lesson-content"
                {...register('content')}
                placeholder="Nhập nội dung bài học..."
                rows={6}
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu bài học</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Import React for useState in dialogs
import * as React from 'react';

import { useState } from 'react';
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
import { CourseDetail } from '../types';

interface EditCourseInfoProps {
  course: CourseDetail;
  onSave: (data: Partial<CourseDetail>) => void;
  isSubmitting: boolean;
}

export default function EditCourseInfo({
  course,
  onSave,
  isSubmitting,
}: EditCourseInfoProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    duration: course.duration,
    price: course.price,
    language: course.language,
    thumbnailURL: course.thumbnailURL,
    categoryName: course.categoryName,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'duration' || name === 'price' ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter course title';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter course description';
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (!formData.language.trim()) {
      newErrors.language = 'Please select a language';
    }
    if (!formData.thumbnailURL.trim()) {
      newErrors.thumbnailURL = 'Please enter image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Course Title */}
      <div>
        <Label htmlFor="title" className="text-base font-semibold mb-2">
          Course Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., IELTS Masterclass"
          disabled={isSubmitting}
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Course Description */}
      <div>
        <Label htmlFor="description" className="text-base font-semibold mb-2">
          Course Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide a detailed description of your course..."
          rows={4}
          disabled={isSubmitting}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Duration and Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="duration" className="text-base font-semibold mb-2">
            Duration (hours) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 40"
            disabled={isSubmitting}
            className={errors.duration ? 'border-red-500' : ''}
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price" className="text-base font-semibold mb-2">
            Price (VND) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 750000"
            disabled={isSubmitting}
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Language and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="language" className="text-base font-semibold mb-2">
            Teaching Language <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.language} onValueChange={(value) => handleSelectChange('language', value)}>
            <SelectTrigger disabled={isSubmitting} className={errors.language ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Vietnamese">Vietnamese</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
              <SelectItem value="Chinese">Chinese</SelectItem>
              <SelectItem value="Korean">Korean</SelectItem>
            </SelectContent>
          </Select>
          {errors.language && (
            <p className="text-red-500 text-sm mt-1">{errors.language}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category" className="text-base font-semibold mb-2">
            Category
          </Label>
          <Input
            id="category"
            name="categoryName"
            value={formData.categoryName}
            disabled={true}
            placeholder="Category (read-only)"
            className="bg-gray-100"
          />
        </div>
      </div>

      {/* Thumbnail URL */}
      <div>
        <Label htmlFor="thumbnailURL" className="text-base font-semibold mb-2">
          Thumbnail Image URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id="thumbnailURL"
          name="thumbnailURL"
          value={formData.thumbnailURL}
          onChange={handleChange}
          placeholder="e.g., https://example.com/image.jpg"
          disabled={isSubmitting}
          className={errors.thumbnailURL ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPG, PNG
        </p>
        {errors.thumbnailURL && (
          <p className="text-red-500 text-sm mt-1">{errors.thumbnailURL}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
}

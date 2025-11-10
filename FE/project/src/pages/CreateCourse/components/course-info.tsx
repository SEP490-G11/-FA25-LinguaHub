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
import { X } from 'lucide-react';
import { getCategories, getLanguages } from '@/queries/course-api';
import { CourseFormData, Language, Category } from '@/queries/course-api';

interface Step1Props {
  data: Partial<CourseFormData>;
  onNext: (data: CourseFormData) => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  categoryID?: string;
  language?: string;
  duration?: string;
  price?: string;
  thumbnailURL?: string;
}

export function Step1CourseInfo({ data, onNext }: Step1Props) {
  const [formData, setFormData] = useState<Partial<CourseFormData>>({
    title: data.title || '',
    description: data.description || '',
    categoryID: data.categoryID || 1 , // Default to first category
    language: data.language || 'English',  // Default to "English"
    duration: data.duration || undefined,
    price: data.price || undefined,
    thumbnailURL: data.thumbnailURL || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [thumbnailURLPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Get hardcoded categories and languages (no API call needed)
  const categories: Category[] = getCategories();
  const languages: Language[] = getLanguages();

  const validateField = (name: string, value: unknown): string | undefined => {
    switch (name) {
      case 'title':
        if (!value || typeof value !== 'string') return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 100) return 'Title must not exceed 100 characters';
        return undefined;

      case 'description':
        if (!value || typeof value !== 'string')
          return 'Description is required';
        if (value.length < 10)
          return 'Description must be at least 10 characters';
        if (value.length > 1000)
          return 'Description must not exceed 1000 characters';
        return undefined;

      case 'categoryID':
        if (!value) return 'Category is required';
        return undefined;

      case 'language':
        if (!value) return 'Language is required';
        return undefined;

      case 'duration':
        if (!value) return 'Duration is required';
        const duration = Number(value);
        if (isNaN(duration)) return 'Duration must be a number';
        if (duration < 1 || duration > 999)
          return 'Duration must be between 1 and 999 hours';
        return undefined;

      case 'price':
        if (value === undefined || value === null || value === '')
          return 'Price is required';
        const price = Number(value);
        if (isNaN(price)) return 'Price must be a number';
        if (price < 0) return 'Price cannot be negative';
        if (price > 999999999) return 'Price must not exceed 999,999,999 VND';
        if (!Number.isInteger(price)) return 'Price must be a whole number';
        return undefined;

      case 'thumbnailURL':
        if (!value) return 'thumbnailURL is required';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof CourseFormData]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleThumbnailUrlChange = (url: string) => {
    // Validate URL format
    if (!url.trim()) {
      setFormData((prev) => ({ ...prev, thumbnailURL: undefined }));
      setThumbnailPreview(null);
      setErrors((prev) => ({ ...prev, thumbnailURL: undefined }));
      return;
    }

    try {
      new URL(url); // Validate URL syntax
      setFormData((prev) => ({ ...prev, thumbnailURL: url }));
      setThumbnailPreview(url);
      setErrors((prev) => ({ ...prev, thumbnailURL: undefined }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        thumbnailURL: 'Please enter a valid URL',
      }));
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnailURL: undefined }));
    setThumbnailPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched: Record<string, boolean> = {};
    const allErrors: ValidationErrors = {};

    // Validate all required fields
    ['title', 'description', 'categoryID', 'language', 'duration', 'price'].forEach((key) => {
      allTouched[key] = true;
      const error = validateField(key, formData[key as keyof CourseFormData]);
      if (error) allErrors[key as keyof ValidationErrors] = error;
    });

    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      onNext(formData as CourseFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Course Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            placeholder="e.g., Complete English for Beginners"
            className={errors.title && touched.title ? 'border-red-500' : ''}
          />
          {errors.title && touched.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            placeholder="Describe your course..."
            rows={4}
            className={
              errors.description && touched.description
                ? 'border-red-500'
                : ''
            }
          />
          <div className="flex justify-between mt-1">
            {errors.description && touched.description ? (
              <p className="text-sm text-red-500">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-sm text-gray-500">
              {formData.description?.length || 0}/1000
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.categoryID?.toString() || ''}
            onValueChange={(value) => {
              handleChange('categoryID', parseInt(value));
              setTouched((prev) => ({ ...prev, categoryID: true }));
            }}
          >
            <SelectTrigger
              className={
                errors.categoryID && touched.categoryID
                  ? 'border-red-500'
                  : ''
              }
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryID && touched.categoryID && (
            <p className="text-sm text-red-500 mt-1">{errors.categoryID}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">
            Instruction Language <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.language || 'English'}
            onValueChange={(value) => {
              handleChange('language', value);
              setTouched((prev) => ({ ...prev, language: true }));
            }}
          >
            <SelectTrigger
              className={
                errors.language && touched.language
                  ? 'border-red-500'
                  : ''
              }
            >
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && touched.language && (
            <p className="text-sm text-red-500 mt-1">{errors.language}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration" className="text-sm font-medium">
              Duration (hours) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="999"
              value={formData.duration || ''}
              onChange={(e) =>
                handleChange('duration', Number(e.target.value))
              }
              onBlur={() => handleBlur('duration')}
              placeholder="e.g., 40"
              className={
                errors.duration && touched.duration
                  ? 'border-red-500'
                  : ''
              }
            />
            {errors.duration && touched.duration && (
              <p className="text-sm text-red-500 mt-1">
                {errors.duration}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="price" className="text-sm font-medium">
              Price (VND) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              max="999999999"
              step="1"
              value={formData.price || ''}
              onChange={(e) =>
                handleChange('price', Number(e.target.value))
              }
              onBlur={() => handleBlur('price')}
              placeholder="e.g., 1500000"
              className={
                errors.price && touched.price ? 'border-red-500' : ''
              }
            />
            {errors.price && touched.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="thumbnailURL-url" className="text-sm font-medium">
            Thumbnail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="thumbnailURL-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={typeof formData.thumbnailURL === 'string' ? formData.thumbnailURL : ''}
            onChange={(e) => handleThumbnailUrlChange(e.target.value)}
            onBlur={() => handleBlur('thumbnailURL')}
            className={
              errors.thumbnailURL && touched.thumbnailURL ? 'border-red-500' : ''
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid image URL (JPG, PNG, or other web-supported formats)
          </p>

          {thumbnailURLPreview && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={thumbnailURLPreview}
                alt="thumbnailURL preview"
                className="w-full h-48 object-cover"
                onError={() => {
                  setErrors((prev) => ({
                    ...prev,
                    thumbnailURL: 'Unable to load image from URL',
                  }));
                }}
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errors.thumbnailURL && touched.thumbnailURL && (
            <p className="text-sm text-red-500 mt-1">{errors.thumbnailURL}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit">Next: Course Content</Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from 'react';
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
import { getLanguages } from '@/pages/TutorPages/CreateCourse/course-api';
import { CourseFormData, Language, Category } from '@/pages/TutorPages/CreateCourse/course-api';
import axios from '@/config/axiosConfig';

interface Step1Props {
  data: Partial<CourseFormData>;
  onNext: (data: CourseFormData) => void;
}

interface ValidationErrors {
  title?: string;
  shortDescription?: string;
  description?: string;
  requirement?: string;
  level?: string;
  categoryID?: string;
  language?: string;
  duration?: string;
  price?: string;
  thumbnailURL?: string;
}

export function Step1CourseInfo({ data, onNext }: Step1Props) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: data.title || '',
    shortDescription: data.shortDescription || '',
    description: data.description || '',
    requirement: data.requirement || '',
    level: data.level || 'BEGINNER',
    categoryID: data.categoryID || 1, // Default to category 1
    language: data.language || 'English',
    duration: data.duration || 0,
    price: data.price || 0,
    thumbnailURL: data.thumbnailURL || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({
    categoryID: true, // Mark as touched so default value is visible
  });
  const [thumbnailURLPreview, setThumbnailPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  // Get languages from constants
  const languages: Language[] = getLanguages();

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        console.log('🔍 Fetching categories from /categories...');
        const response = await axios.get('/categories');
        console.log('📊 Categories API response:', response);
        console.log('📊 Response data:', response?.data);
        
        // Try different response formats
        let rawData = [];
        if (response?.data?.result) {
          rawData = response.data.result;
        } else if (Array.isArray(response?.data)) {
          rawData = response.data;
        } else if (response?.data?.data) {
          rawData = response.data.data;
        }
        
        // Map backend format to frontend format
        const categoriesData = rawData.map((cat: any) => ({
          id: cat.categoryId || cat.id,
          name: cat.categoryName || cat.name,
        }));
        
        console.log('✅ Mapped categories:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const validateField = (name: string, value: unknown): string | undefined => {
    switch (name) {
      case 'title':
        if (!value || typeof value !== 'string') return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 100) return 'Title must not exceed 100 characters';
        return undefined;

      case 'shortDescription':
        if (!value || typeof value !== 'string')
          return 'Short description is required';
        if (value.length < 5)
          return 'Short description must be at least 5 characters';
        if (value.length > 200)
          return 'Short description must not exceed 200 characters';
        return undefined;

      case 'description':
        if (!value || typeof value !== 'string')
          return 'Description is required';
        if (value.length < 5)
          return 'Description must be at least 5 characters';
        if (value.length > 1000)
          return 'Description must not exceed 1000 characters';
        return undefined;

      case 'requirement':
        if (!value || typeof value !== 'string')
          return 'Requirements are required';
        if (value.length < 5)
          return 'Requirements must be at least 5 characters';
        if (value.length > 500)
          return 'Requirements must not exceed 500 characters';
        return undefined;

      case 'level':
        if (!value) return 'Level is required';
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
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'duration' || name === 'price' 
        ? Number(value) || 0 
        : value 
    }));
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
    ['title', 'shortDescription', 'description', 'requirement', 'categoryID', 'language', 'level', 'duration', 'price'].forEach((key) => {
      allTouched[key] = true;
      const error = validateField(key, formData[key as keyof CourseFormData]);
      if (error) allErrors[key as keyof ValidationErrors] = error;
    });

    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      console.log('Form data before submit:', formData);
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
          <Label htmlFor="shortDescription" className="text-sm font-medium">
            Short Description <span className="text-red-500">*</span>
          </Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription || ''}
            onChange={(e) => handleChange('shortDescription', e.target.value)}
            onBlur={() => handleBlur('shortDescription')}
            placeholder="Brief summary of your course (max 200 characters)"
            maxLength={200}
            className={errors.shortDescription && touched.shortDescription ? 'border-red-500' : ''}
          />
          <div className="flex justify-between mt-1">
            {errors.shortDescription && touched.shortDescription ? (
              <p className="text-sm text-red-500">{errors.shortDescription}</p>
            ) : (
              <span />
            )}
            <p className="text-sm text-gray-500">
              {formData.shortDescription?.length || 0}/200
            </p>
          </div>
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
          <Label htmlFor="requirement" className="text-sm font-medium">
            Requirements <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="requirement"
            value={formData.requirement || ''}
            onChange={(e) => handleChange('requirement', e.target.value)}
            onBlur={() => handleBlur('requirement')}
            placeholder="List the requirements to take this course..."
            rows={4}
            className={
              errors.requirement && touched.requirement
                ? 'border-red-500'
                : ''
            }
          />
          <div className="flex justify-between mt-1">
            {errors.requirement && touched.requirement ? (
              <p className="text-sm text-red-500">{errors.requirement}</p>
            ) : (
              <span />
            )}
            <p className="text-sm text-gray-500">
              {formData.requirement?.length || 0}/500
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
              {isLoadingCategories ? (
                <SelectItem value="loading" disabled>
                  Loading categories...
                </SelectItem>
              ) : categories.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No categories available
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.categoryID && touched.categoryID && (
            <p className="text-sm text-red-500 mt-1">{errors.categoryID}</p>
          )}
        </div>

        <div>
          <Label htmlFor="level" className="text-sm font-medium">
            Level <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.level || 'BEGINNER'}
            onValueChange={(value) => {
              handleChange('level', value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED');
              setTouched((prev) => ({ ...prev, level: true }));
            }}
          >
            <SelectTrigger
              className={
                errors.level && touched.level
                  ? 'border-red-500'
                  : ''
              }
            >
              <SelectValue placeholder="Select a level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {errors.level && touched.level && (
            <p className="text-sm text-red-500 mt-1">{errors.level}</p>
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

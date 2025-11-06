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
import { courseApi } from '@/queries/course-api';
import { CourseFormData, Language, Category } from '@/queries/course-api';

interface Step1Props {
  data: Partial<CourseFormData>;
  onNext: (data: CourseFormData) => void;
  onCancel: () => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  category_id?: string;
  languages?: string;
  duration_hours?: string;
  price_vnd?: string;
  thumbnail?: string;
}

// Default categories for fallback when API is unavailable
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ielts', name: 'IELTS' },
  { id: 'topik', name: 'TOPIK' },
  { id: 'toeic', name: 'TOEIC' },
  { id: 'hsk', name: 'HSK' },
  { id: 'jlpt', name: 'JLPT' },
];

// Default languages for fallback when API is unavailable
const DEFAULT_LANGUAGES: Language[] = [
  { id: 'en', name: 'English' },
  { id: 'vi', name: 'Vietnamese' },
  { id: 'zh', name: 'Chinese' },
  { id: 'ja', name: 'Japanese' },
  { id: 'ko', name: 'Korean' },
  { id: 'es', name: 'Spanish' },
  { id: 'fr', name: 'French' },
  { id: 'de', name: 'German' },
  { id: 'it', name: 'Italian' },
];

export function Step1CourseInfo({ data, onNext, onCancel }: Step1Props) {
  const [formData, setFormData] = useState<Partial<CourseFormData>>({
    title: data.title || '',
    description: data.description || '',
    category_id: data.category_id || '',
    languages: data.languages || [],
    duration_hours: data.duration_hours || undefined,
    price_vnd: data.price_vnd || undefined,
    thumbnail: data.thumbnail,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const resp = await courseApi.getCategories();
        // Normalize possible response shapes
        let categoriesArray: Category[] = [];
        if (Array.isArray(resp)) {
          categoriesArray = resp;
        } else if (resp && typeof resp === 'object') {
          const r = resp as Record<string, unknown>;
          if (Array.isArray(r.data)) {
            categoriesArray = r.data as Category[];
          } else if (Array.isArray(r.categories)) {
            categoriesArray = r.categories as Category[];
          }
        }

        // If API returned valid data, use it; otherwise keep defaults
        if (categoriesArray && categoriesArray.length > 0) {
          setCategories(categoriesArray);
        }
      } catch (error) {
        console.error('Failed to load categories, using defaults:', error);
        // Keep using DEFAULT_CATEGORIES
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Fetch languages on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const resp = await courseApi.getLanguages();
        // Normalize possible response shapes
        let languagesArray: Language[] = [];
        if (Array.isArray(resp)) {
          languagesArray = resp;
        } else if (resp && typeof resp === 'object') {
          const r = resp as Record<string, unknown>;
          if (Array.isArray(r.data)) {
            languagesArray = r.data as Language[];
          } else if (Array.isArray(r.languages)) {
            languagesArray = r.languages as Language[];
          }
        }

        // If API returned valid data, use it; otherwise keep defaults
        if (languagesArray && languagesArray.length > 0) {
          setLanguages(languagesArray);
        }
      } catch (error) {
        console.error('Failed to load languages, using defaults:', error);
        // Keep using DEFAULT_LANGUAGES
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);

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

      case 'category_id':
        if (!value) return 'Category is required';
        return undefined;

      case 'languages':
        if (!value || (Array.isArray(value) && value.length === 0))
          return 'At least one language is required';
        return undefined;

      case 'duration_hours':
        if (!value) return 'Duration is required';
        const duration = Number(value);
        if (isNaN(duration)) return 'Duration must be a number';
        if (duration < 1 || duration > 999)
          return 'Duration must be between 1 and 999 hours';
        return undefined;

      case 'price_vnd':
        if (value === undefined || value === null || value === '')
          return 'Price is required';
        const price = Number(value);
        if (isNaN(price)) return 'Price must be a number';
        if (price < 0) return 'Price cannot be negative';
        if (price > 999999999) return 'Price must not exceed 999,999,999 VND';
        if (!Number.isInteger(price)) return 'Price must be a whole number';
        return undefined;

      case 'thumbnail':
        if (!value) return 'Thumbnail is required';
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
      setFormData((prev) => ({ ...prev, thumbnail: undefined }));
      setThumbnailPreview(null);
      setErrors((prev) => ({ ...prev, thumbnail: undefined }));
      return;
    }

    try {
      new URL(url); // Validate URL syntax
      setFormData((prev) => ({ ...prev, thumbnail: url }));
      setThumbnailPreview(url);
      setErrors((prev) => ({ ...prev, thumbnail: undefined }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        thumbnail: 'Please enter a valid URL',
      }));
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail: undefined }));
    setThumbnailPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched: Record<string, boolean> = {};
    const allErrors: ValidationErrors = {};

    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
      const error = validateField(
        key,
        formData[key as keyof CourseFormData]
      );
      if (error) allErrors[key as keyof ValidationErrors] = error;
    });

    ['title', 'description', 'category_id', 'languages', 'duration_hours', 'price_vnd', 'thumbnail'].forEach((key) => {
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
            value={formData.category_id || ''}
            onValueChange={(value) => {
              handleChange('category_id', value);
              // Mark as touched only after a selection is made
              setTouched((prev) => ({ ...prev, category_id: true }));
            }}
          >
            <SelectTrigger
              className={
                errors.category_id && touched.category_id
                  ? 'border-red-500'
                  : ''
              }
            >
              <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select a category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && touched.category_id && (
            <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">
            Select Instruction Language <span className="text-red-500">*</span>
          </Label>
          <Select
            value={Array.isArray(formData.languages) && formData.languages.length > 0 ? formData.languages[0] : ''}
            onValueChange={(value) => {
              handleChange('languages', [value]);
              // Mark as touched only after a selection is made
              setTouched((prev) => ({ ...prev, languages: true }));
            }}
          >
            <SelectTrigger
              className={
                errors.languages && touched.languages
                  ? 'border-red-500'
                  : ''
              }
            >
              <SelectValue placeholder={isLoadingLanguages ? "Loading..." : "Select a language"} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.languages && touched.languages && (
            <p className="text-sm text-red-500 mt-1">{errors.languages}</p>
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
              value={formData.duration_hours || ''}
              onChange={(e) =>
                handleChange('duration_hours', Number(e.target.value))
              }
              onBlur={() => handleBlur('duration_hours')}
              placeholder="e.g., 40"
              className={
                errors.duration_hours && touched.duration_hours
                  ? 'border-red-500'
                  : ''
              }
            />
            {errors.duration_hours && touched.duration_hours && (
              <p className="text-sm text-red-500 mt-1">
                {errors.duration_hours}
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
              value={formData.price_vnd || ''}
              onChange={(e) =>
                handleChange('price_vnd', Number(e.target.value))
              }
              onBlur={() => handleBlur('price_vnd')}
              placeholder="e.g., 1500000"
              className={
                errors.price_vnd && touched.price_vnd ? 'border-red-500' : ''
              }
            />
            {errors.price_vnd && touched.price_vnd && (
              <p className="text-sm text-red-500 mt-1">{errors.price_vnd}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="thumbnail-url" className="text-sm font-medium">
            Thumbnail URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="thumbnail-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={typeof formData.thumbnail === 'string' ? formData.thumbnail : ''}
            onChange={(e) => handleThumbnailUrlChange(e.target.value)}
            onBlur={() => handleBlur('thumbnail')}
            className={
              errors.thumbnail && touched.thumbnail ? 'border-red-500' : ''
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid image URL (JPG, PNG, or other web-supported formats)
          </p>

          {thumbnailPreview && (
            <div className="relative mt-3 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover"
                onError={() => {
                  setErrors((prev) => ({
                    ...prev,
                    thumbnail: 'Unable to load image from URL',
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

          {errors.thumbnail && touched.thumbnail && (
            <p className="text-sm text-red-500 mt-1">{errors.thumbnail}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Next: Course Content</Button>
      </div>
    </form>
  );
}

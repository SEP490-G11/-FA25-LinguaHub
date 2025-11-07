import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  Languages, 
  Award, 
  Briefcase, 
  FileText, 
  Upload, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { TutorApplicationFormData } from '../types';

// ==========================================================
// Phase 1.2: Form Validation Schema (Zod)
// ==========================================================

const applicationSchema = z.object({
  teachingLanguages: z
    .array(z.string())
    .min(1, 'Please select at least one teaching language'),
  specialization: z
    .string()
    .min(3, 'Specialization must be at least 3 characters')
    .max(255, 'Specialization must not exceed 255 characters'),
  experience: z
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience must be less than 50 years'),
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(1000, 'Bio must not exceed 1000 characters'),
  certificateName: z
    .string()
    .min(3, 'Certificate name must be at least 3 characters')
    .max(255, 'Certificate name must not exceed 255 characters'),
  certificateUrl: z
    .string()
    .url('Please enter a valid URL')
    .min(1, 'Certificate URL is required'),
});

type FormData = z.infer<typeof applicationSchema>;

// Available teaching languages
const AVAILABLE_LANGUAGES = [
  'English',
  'Korean',
  'Japanese',
  'Chinese',
  'French',
  'Spanish',
  'German',
  'Vietnamese',
  'Thai',
  'Italian',
];

interface TutorApplicationFormProps {
  onSubmit: (data: TutorApplicationFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
}

// ==========================================================
// Phase 1.1: UI Component
// ==========================================================

export function TutorApplicationForm({ 
  onSubmit, 
  isSubmitting,
  error 
}: TutorApplicationFormProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      teachingLanguages: [],
      specialization: '',
      experience: 0,
      bio: '',
      certificateName: '',
      certificateUrl: '',
    },
  });

  const handleLanguageToggle = (language: string) => {
    const updated = selectedLanguages.includes(language)
      ? selectedLanguages.filter((l) => l !== language)
      : [...selectedLanguages, language];

    setSelectedLanguages(updated);
    setValue('teachingLanguages', updated, { shouldValidate: true });
  };

  const onFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Single Card with All Sections */}
      <div className="space-y-8">
        {/* Teaching Languages Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Teaching Languages</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select the languages you can teach (at least one)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_LANGUAGES.map((language) => (
              <button
                key={language}
                type="button"
                className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                  selectedLanguages.includes(language)
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
                onClick={() => handleLanguageToggle(language)}
              >
                {language}
              </button>
            ))}
          </div>
          {errors.teachingLanguages && (
            <p className="text-sm text-red-500 mt-2">
              {errors.teachingLanguages.message}
            </p>
          )}
        </div>

        {/* Specialization & Experience */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-indigo-600" />
              <Label htmlFor="specialization" className="text-base font-semibold">
                Specialization <span className="text-red-500">*</span>
              </Label>
            </div>
            <Input
              id="specialization"
              {...register('specialization')}
              placeholder="e.g., Business English, IELTS Preparation"
              className="text-base"
            />
            {errors.specialization && (
              <p className="text-sm text-red-500 mt-1">
                {errors.specialization.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <Label htmlFor="experience" className="text-base font-semibold">
                Years of Experience <span className="text-red-500">*</span>
              </Label>
            </div>
            <Input
              id="experience"
              {...register('experience', { valueAsNumber: true })}
              type="number"
              min="0"
              max="50"
              placeholder="Years of experience"
              className="text-base"
            />
            {errors.experience && (
              <p className="text-sm text-red-500 mt-1">
                {errors.experience.message}
              </p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
            <Label htmlFor="bio" className="text-base font-semibold">
              Professional Bio <span className="text-red-500">*</span>
            </Label>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Tell us about your teaching background and approach (50-1000 characters)
          </p>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder="Describe your teaching experience, methods, achievements, and what makes you a great tutor..."
            rows={6}
            className="resize-none text-base"
          />
          <div className="flex justify-between items-center mt-2">
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {errors.bio ? '' : 'Minimum 50 characters'}
            </p>
          </div>
        </div>

        {/* Certificate Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Teaching Certificate</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Provide your teaching certificate or credential information
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="certificateName">
                Certificate Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="certificateName"
                {...register('certificateName')}
                placeholder="e.g., TESOL Certificate, TEFL Certification"
                className="mt-1 text-base"
              />
              {errors.certificateName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.certificateName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="certificateUrl">
                Certificate URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="certificateUrl"
                {...register('certificateUrl')}
                placeholder="https://example.com/your-certificate.pdf"
                className="mt-1 text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a link to your certificate (Google Drive, Dropbox, or any cloud storage)
              </p>
              {errors.certificateUrl && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.certificateUrl.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Submitting Application...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

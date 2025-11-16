import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tutorApplicationSchema, TutorApplicationFormData } from '../schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApplicationFormProps {
  onSubmit: (data: TutorApplicationFormData) => void;
  isSubmitting?: boolean;
}

export function ApplicationForm({ onSubmit, isSubmitting = false }: ApplicationFormProps) {
  const form = useForm<TutorApplicationFormData>({
    resolver: zodResolver(tutorApplicationSchema),
    mode: 'onChange',
    defaultValues: {
      experience: 0,
      specialization: '',
      teachingLanguage: '',
      bio: '',
      certificates: [{ certificateName: '', documentUrl: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'certificates',
  });

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Apply to Become a Tutor</CardTitle>
        <CardDescription>
          Fill out the form below to submit your application to become a tutor on our platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Experience Field */}
            <FormField
              control={form.control}
              name="experience"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Experience (years) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your years of teaching experience"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      disabled={isSubmitting}
                      className={cn(
                        'transition-all duration-200',
                        fieldState.error && 'border-red-500 focus-visible:ring-red-500',
                        !fieldState.error && field.value > 0 && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      aria-describedby={fieldState.error ? 'experience-error' : 'experience-description'}
                    />
                  </FormControl>
                  <FormDescription id="experience-description">
                    How many years of teaching experience do you have?
                  </FormDescription>
                  <FormMessage id="experience-error" />
                </FormItem>
              )}
            />

            {/* Specialization Field */}
            <FormField
              control={form.control}
              name="specialization"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Specialization *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Mathematics, English, Programming"
                      {...field}
                      disabled={isSubmitting}
                      className={cn(
                        'transition-all duration-200',
                        fieldState.error && 'border-red-500 focus-visible:ring-red-500',
                        !fieldState.error && field.value.length >= 3 && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      aria-describedby={fieldState.error ? 'specialization-error' : 'specialization-description'}
                    />
                  </FormControl>
                  <FormDescription id="specialization-description">
                    What is your area of expertise?
                  </FormDescription>
                  <FormMessage id="specialization-error" />
                </FormItem>
              )}
            />

            {/* Teaching Language Field */}
            <FormField
              control={form.control}
              name="teachingLanguage"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Teaching Language *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., English, Vietnamese, Spanish"
                      {...field}
                      disabled={isSubmitting}
                      className={cn(
                        'transition-all duration-200',
                        fieldState.error && 'border-red-500 focus-visible:ring-red-500',
                        !fieldState.error && field.value.length >= 2 && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      aria-invalid={fieldState.error ? 'true' : 'false'}
                      aria-describedby={fieldState.error ? 'teaching-language-error' : 'teaching-language-description'}
                    />
                  </FormControl>
                  <FormDescription id="teaching-language-description">
                    What language will you primarily teach in?
                  </FormDescription>
                  <FormMessage id="teaching-language-error" />
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field, fieldState }) => {
                const charCount = field.value?.length || 0;
                const maxChars = 1000;
                const minChars = 50;
                const isValid = charCount >= minChars && charCount <= maxChars;
                
                return (
                  <FormItem>
                    <FormLabel>Bio *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself, your teaching philosophy, and why you want to become a tutor..."
                        className={cn(
                          'min-h-[120px] resize-none transition-all duration-200',
                          fieldState.error && 'border-red-500 focus-visible:ring-red-500',
                          !fieldState.error && isValid && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        {...field}
                        disabled={isSubmitting}
                        aria-invalid={fieldState.error ? 'true' : 'false'}
                        aria-describedby={fieldState.error ? 'bio-error' : 'bio-description'}
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormDescription id="bio-description">
                        Minimum 50 characters. Share your background and teaching approach.
                      </FormDescription>
                      <span 
                        className={cn(
                          'text-sm transition-colors duration-200',
                          charCount < minChars && 'text-muted-foreground',
                          charCount >= minChars && charCount <= maxChars && 'text-green-600',
                          charCount > maxChars && 'text-red-600'
                        )}
                        aria-live="polite"
                      >
                        {charCount}/{maxChars}
                      </span>
                    </div>
                    <FormMessage id="bio-error" />
                  </FormItem>
                );
              }}
            />

            {/* Certificates Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel>Certificates *</FormLabel>
                  <FormDescription>
                    Add at least one certificate to demonstrate your qualifications
                  </FormDescription>
                </div>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="relative transition-all duration-300 hover:shadow-md">
                  <CardContent className="pt-6 space-y-4">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 transition-all duration-200 hover:scale-110 hover:bg-red-50"
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                        aria-label={`Remove certificate ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Certificate Name Field */}
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.certificateName`}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Certificate Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., TESOL Certificate, Master's Degree in Education"
                              {...field}
                              disabled={isSubmitting}
                              className={cn(
                                'transition-all duration-200',
                                fieldState.error && 'border-red-500 focus-visible:ring-red-500',
                                !fieldState.error && field.value.length > 0 && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              aria-invalid={fieldState.error ? 'true' : 'false'}
                              aria-describedby={fieldState.error ? `certificate-name-${index}-error` : undefined}
                            />
                          </FormControl>
                          <FormMessage id={`certificate-name-${index}-error`} />
                        </FormItem>
                      )}
                    />

                    {/* Document URL Field */}
                    <FormField
                      control={form.control}
                      name={`certificates.${index}.documentUrl`}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Document URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com/certificate.pdf"
                              {...field}
                              disabled={isSubmitting}
                              className={cn(
                                'transition-all duration-200',
                                fieldState.error && 'border-red-500 focus-visible:ring-red-500',
                                !fieldState.error && field.value.length > 0 && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              aria-invalid={fieldState.error ? 'true' : 'false'}
                              aria-describedby={fieldState.error ? `document-url-${index}-error` : undefined}
                            />
                          </FormControl>
                          <FormMessage id={`document-url-${index}-error`} />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                onClick={() => append({ certificateName: '', documentUrl: '' })}
                disabled={isSubmitting}
                aria-label="Add another certificate"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !form.formState.isValid || form.formState.isSubmitting} 
              className="w-full transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isSubmitting ? 'Submitting application' : 'Submit application'}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Application'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

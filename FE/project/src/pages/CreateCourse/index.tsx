import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Import local modules (new structure)
import { useCourseInfoForm, useLessonForm, validateCourseContent } from './form';
import type { CourseInfoFormValues, LessonFormValues } from './form';
import type { SectionData, LessonData } from './types';
import { createCourseApi, saveCourseContentApi } from './api';
import {
  CourseInfoUI,
  CourseContentUI,
  SectionFormDialog,
  LessonFormDialog,
} from './ui';
import { debugToken, isAuthenticated } from './auth-helper';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔍 Debug: Check authentication on component mount
  console.log('🔐 CreateCourse mounted - checking auth...');
  debugToken();

  // ============ State Management ============
  const [currentStep, setCurrentStep] = useState(1);
  const [courseId, setCourseId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Course Info Form
  const courseInfoForm = useCourseInfoForm();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Step 2: Course Content
  const [sections, setSections] = useState<SectionData[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  // Section Dialog
  const [sectionDialog, setSectionDialog] = useState<{
    open: boolean;
    editIndex?: number;
    data?: { title: string; description: string };
  }>({ open: false });

  // Lesson Dialog
  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean;
    sectionIndex?: number;
    editLessonIndex?: number;
  }>({ open: false });
  const lessonForm = useLessonForm();

  // ============ STEP 1 Handlers ============
  const handleThumbnailChange = (url: string) => {
    if (!url.trim()) {
      setThumbnailPreview(null);
      return;
    }
    try {
      new URL(url);
      setThumbnailPreview(url);
    } catch {
      setThumbnailPreview(null);
    }
  };

  const handleRemoveThumbnail = () => {
    courseInfoForm.setValue('thumbnailURL', '');
    setThumbnailPreview(null);
  };

  const handleStep1Submit = async (data: CourseInfoFormValues) => {
    // � Check authentication first
    if (!isAuthenticated()) {
      console.error('❌ Not authenticated!');
      toast({
        variant: 'destructive',
        title: 'Chưa đăng nhập',
        description: 'Vui lòng đăng nhập để tạo khóa học',
      });
      navigate('/login');
      return;
    }

    // �🔍 Console log để kiểm tra data
    console.group('📝 Step 1: Course Info Data');
    console.log('Form Data:', data);
    console.log('categoryID type:', typeof data.categoryID, '→', data.categoryID);
    console.log('language type:', typeof data.language, '→', data.language);
    console.log('duration type:', typeof data.duration, '→', data.duration);
    console.log('price type:', typeof data.price, '→', data.price);
    console.groupEnd();

    setIsSubmitting(true);
    try {
      console.log('🚀 Calling API: POST /tutor/courses');
      const result = await createCourseApi(data);
      console.log('✅ API Response:', result);
      
      if (result.success && result.courseId) {
        setCourseId(result.courseId);
        setCurrentStep(2);
        toast({
          title: 'Thành công!',
          description: 'Thông tin khóa học đã được lưu',
        });
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err instanceof Error ? err.message : 'Không thể tạo khóa học',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Bạn có chắc muốn hủy? Tất cả thay đổi sẽ bị mất.')) {
      navigate('/tutor/courses');
    }
  };

  // ============ STEP 2 Handlers - Sections ============
  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleAddSection = () => {
    setSectionDialog({ open: true });
  };

  const handleEditSection = (index: number) => {
    setSectionDialog({
      open: true,
      editIndex: index,
      data: {
        title: sections[index].title,
        description: sections[index].description || '',
      },
    });
  };

  const handleSaveSection = (data: { title: string; description: string }) => {
    if (sectionDialog.editIndex !== undefined) {
      // Edit existing
      setSections((prev) =>
        prev.map((s, i) =>
          i === sectionDialog.editIndex
            ? { ...s, title: data.title, description: data.description }
            : s
        )
      );
    } else {
      // Add new
      setSections((prev) => [
        ...prev,
        {
          title: data.title,
          description: data.description,
          order_index: prev.length,
          lessons: [],
        },
      ]);
      setExpandedSections((prev) => new Set([...prev, sections.length]));
    }
    setSectionDialog({ open: false });
  };

  const handleDeleteSection = (index: number) => {
    if (confirm('Xóa section này?')) {
      setSections((prev) =>
        prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order_index: i }))
      );
    }
  };

  const handleMoveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [
        newSections[index],
        newSections[index - 1],
      ];
      return newSections.map((s, i) => ({ ...s, order_index: i }));
    });
  };

  const handleMoveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
      return newSections.map((s, i) => ({ ...s, order_index: i }));
    });
  };

  // ============ STEP 2 Handlers - Lessons ============
  const handleAddLesson = (sectionIndex: number) => {
    lessonForm.reset({
      title: '',
      duration_minutes: undefined,
      lesson_type: 'Video',
      video_url: '',
      content: '',
    });
    setLessonDialog({ open: true, sectionIndex });
  };

  const handleEditLesson = (sectionIndex: number, lessonIndex: number) => {
    const lesson = sections[sectionIndex].lessons[lessonIndex];
    lessonForm.reset({
      title: lesson.title,
      duration_minutes: lesson.duration_minutes,
      lesson_type: lesson.lesson_type,
      video_url: lesson.video_url || '',
      content: lesson.content || '',
    });
    setLessonDialog({ open: true, sectionIndex, editLessonIndex: lessonIndex });
  };

  const handleSaveLesson = (data: LessonFormValues) => {
    if (lessonDialog.sectionIndex === undefined) return;

    const newLesson: LessonData = {
      title: data.title,
      duration_minutes: data.duration_minutes,
      lesson_type: data.lesson_type,
      video_url: data.video_url,
      content: data.content,
      order_index: 0, // Will be set below
    };

    setSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== lessonDialog.sectionIndex) return section;

        if (lessonDialog.editLessonIndex !== undefined) {
          // Edit existing
          return {
            ...section,
            lessons: section.lessons.map((l, lIdx) =>
              lIdx === lessonDialog.editLessonIndex ? { ...l, ...newLesson } : l
            ),
          };
        } else {
          // Add new
          return {
            ...section,
            lessons: [
              ...section.lessons,
              { ...newLesson, order_index: section.lessons.length },
            ],
          };
        }
      })
    );

    setLessonDialog({ open: false });
  };

  const handleDeleteLesson = (sectionIndex: number, lessonIndex: number) => {
    if (confirm('Xóa bài học này?')) {
      setSections((prev) =>
        prev.map((section, sIdx) =>
          sIdx === sectionIndex
            ? {
                ...section,
                lessons: section.lessons
                  .filter((_, lIdx) => lIdx !== lessonIndex)
                  .map((l, lIdx) => ({ ...l, order_index: lIdx })),
              }
            : section
        )
      );
    }
  };

  const handleMoveLessonUp = (sectionIndex: number, lessonIndex: number) => {
    if (lessonIndex === 0) return;
    setSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        const lessons = [...section.lessons];
        [lessons[lessonIndex - 1], lessons[lessonIndex]] = [
          lessons[lessonIndex],
          lessons[lessonIndex - 1],
        ];
        return {
          ...section,
          lessons: lessons.map((l, lIdx) => ({ ...l, order_index: lIdx })),
        };
      })
    );
  };

  const handleMoveLessonDown = (sectionIndex: number, lessonIndex: number) => {
    setSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        if (lessonIndex === section.lessons.length - 1) return section;
        const lessons = [...section.lessons];
        [lessons[lessonIndex], lessons[lessonIndex + 1]] = [
          lessons[lessonIndex + 1],
          lessons[lessonIndex],
        ];
        return {
          ...section,
          lessons: lessons.map((l, lIdx) => ({ ...l, order_index: lIdx })),
        };
      })
    );
  };

  // ============ STEP 2 Submit ============
  const handleStep2Save = async () => {
    // 🔍 Console log để kiểm tra sections data
    console.group('📚 Step 2: Course Content Data');
    console.log('Course ID:', courseId);
    console.log('Total Sections:', sections.length);
    console.log('Sections Data:', sections);
    
    sections.forEach((section, sIdx) => {
      console.group(`Section ${sIdx + 1}: ${section.title}`);
      console.log('Lessons:', section.lessons.length);
      section.lessons.forEach((lesson, lIdx) => {
        console.log(`  Lesson ${lIdx + 1}: ${lesson.title} (${lesson.lesson_type})`);
        if (lesson.resources?.length) {
          console.log(`    Resources: ${lesson.resources.length}`);
        }
      });
      console.groupEnd();
    });
    console.groupEnd();

    const validation = validateCourseContent(sections);
    if (!validation.valid) {
      console.warn('⚠️ Validation Failed:', validation.error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: validation.error,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🚀 Calling API: saveCourseContentApi');
      const result = await saveCourseContentApi(courseId, sections);
      console.log('✅ API Response:', result);
      
      if (result.success) {
        toast({
          title: 'Thành công!',
          description: 'Khóa học đã được tạo thành công!',
          duration: 2000,
        });
        setTimeout(() => {
          navigate('/tutor/courses');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err instanceof Error ? err.message : 'Không thể lưu nội dung khóa học',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  // ============ Render ============
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tạo khóa học mới</h1>
          <p className="mt-2 text-sm text-gray-600">
            Chia sẻ kiến thức của bạn bằng cách tạo một khóa học hấp dẫn
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-md">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle2 className="w-6 h-6" /> : '1'}
                </div>
                <span className="mt-2 text-sm font-medium">Thông tin khóa học</span>
              </div>

              <div
                className={`h-1 flex-1 mx-4 ${
                  currentStep > 1 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />

              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === 2
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  2
                </div>
                <span className="mt-2 text-sm font-medium">Nội dung khóa học</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 ? 'Bước 1: Thông tin cơ bản' : 'Bước 2: Cấu trúc khóa học'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <CourseInfoUI
                form={courseInfoForm}
                thumbnailPreview={thumbnailPreview}
                onThumbnailChange={handleThumbnailChange}
                onRemoveThumbnail={handleRemoveThumbnail}
                onSubmit={handleStep1Submit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep === 2 && (
              <CourseContentUI
                sections={sections}
                expandedSections={expandedSections}
                onToggleSection={toggleSection}
                onAddSection={handleAddSection}
                onEditSection={handleEditSection}
                onDeleteSection={handleDeleteSection}
                onMoveSectionUp={handleMoveSectionUp}
                onMoveSectionDown={handleMoveSectionDown}
                onAddLesson={handleAddLesson}
                onEditLesson={handleEditLesson}
                onDeleteLesson={handleDeleteLesson}
                onMoveLessonUp={handleMoveLessonUp}
                onMoveLessonDown={handleMoveLessonDown}
                onSave={handleStep2Save}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <SectionFormDialog
          open={sectionDialog.open}
          onClose={() => setSectionDialog({ open: false })}
          onSave={handleSaveSection}
          initialData={sectionDialog.data}
        />

        <LessonFormDialog
          open={lessonDialog.open}
          onClose={() => setLessonDialog({ open: false })}
          onSave={handleSaveLesson}
          form={lessonForm}
        />

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
                <p className="text-lg font-medium text-gray-900">
                  Đang tạo khóa học...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Vui lòng đợi trong giây lát
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Video,
  FileText,
  Link2,
  BookOpen,
} from 'lucide-react';
import { SectionData, LessonData } from '@/pages/CreateCourse/course-api';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Step2Props {
  sections: SectionData[];
  onSave: (sections: SectionData[]) => void;
  onBack?: () => void; // Made optional
  submitButtonText?: string; // Customize submit button text
}

interface SectionFormData {
  title: string;
  description: string;
}

interface LessonFormData {
  title: string;
  duration: number;
  lessonType: 'Video' | 'Reading';
  videoURL?: string;
  content?: string;
  resources?: LessonResourceData[];
}

interface LessonResourceData {
  resourceType: 'PDF' | 'ExternalLink';
  resourceTitle: string;
  resourceURL: string;
}

interface ResourceFormData {
  resourceType: 'PDF' | 'ExternalLink';
  resourceTitle: string;
  resourceURL: string;
}

export function Step2CourseContent({ 
  sections: initialSections, 
  onSave, 
  onBack,
  submitButtonText = 'Create Course' // Default text for CreateCourse
}: Step2Props) {
  const [sections, setSections] = useState<SectionData[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );

  const [editingSection, setEditingSection] = useState<{
    index: number;
    data: SectionFormData;
  } | null>(null);

  const [editingLesson, setEditingLesson] = useState<{
    sectionIndex: number;
    lessonIndex: number;
    data: LessonFormData;
  } | null>(null);

  const [newSection, setNewSection] = useState<SectionFormData | null>(null);
  const [newLesson, setNewLesson] = useState<{
    sectionIndex: number;
    data: LessonFormData;
  } | null>(null);

  // Resource management states
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
  const [resourceForm, setResourceForm] = useState<ResourceFormData>({
    resourceType: 'PDF',
    resourceTitle: '',
    resourceURL: '',
  });
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [resourceFormErrors, setResourceFormErrors] = useState<{
    resourceTitle?: string;
    resourceURL?: string;
  }>({});
  
  // Custom confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  // Helper function to validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addSection = () => {
    setNewSection({ title: '', description: '' });
  };

  const saveNewSection = () => {
    if (!newSection?.title.trim()) return;

    setSections((prev) => [
      ...prev,
      {
        title: newSection.title,
        description: newSection.description,
        orderIndex: prev.length,
        lessons: [],
      },
    ]);
    setNewSection(null);
    setExpandedSections((prev) => new Set([...prev, sections.length]));
  };

  const startEditSection = (index: number) => {
    setEditingSection({
      index,
      data: {
        title: sections[index].title,
        description: sections[index].description || '',
      },
    });
  };

  const saveEditSection = () => {
    if (!editingSection || !editingSection.data.title.trim()) return;

    setSections((prev) =>
      prev.map((section, idx) =>
        idx === editingSection.index
          ? {
              ...section,
              title: editingSection.data.title,
              description: editingSection.data.description,
            }
          : section
      )
    );
    setEditingSection(null);
  };

  const deleteSection = (index: number) => {
    if (!confirm('Delete this section and all its lessons?')) return;

    setSections((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.map((section, idx) => ({
        ...section,
        orderIndex: idx,
      }));
    });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((section, idx) => ({
        ...section,
        orderIndex: idx,
      }));
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const updated = [...prev];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((section, idx) => ({
        ...section,
        orderIndex: idx,
      }));
    });
  };

  const addLesson = (sectionIndex: number) => {
    setNewLesson({
      sectionIndex,
      data: {
        title: '',
        duration: 0,
        lessonType: 'Video',
        videoURL: '',
        content: '',
        resources: [],
      },
    });
    setIsEditingLesson(false);
  };

  const saveNewLesson = () => {
    if (
      !newLesson ||
      !newLesson.data.title.trim() ||
      newLesson.data.duration <= 0
    ) {
      return;
    }

    // Validate based on lesson type
    if (newLesson.data.lessonType === 'Video' && !newLesson.data.videoURL?.trim()) {
      alert('Please enter a video URL for this video lesson');
      return;
    }

    setSections((prev) =>
      prev.map((section, idx) =>
        idx === newLesson.sectionIndex
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                {
                  ...newLesson.data,
                  orderIndex: section.lessons.length,
                } as LessonData,
              ],
            }
          : section
      )
    );
    setNewLesson(null);
  };

  const startEditLesson = (sectionIndex: number, lessonIndex: number) => {
    const lesson = sections[sectionIndex].lessons[lessonIndex];
    setEditingLesson({
      sectionIndex,
      lessonIndex,
      data: {
        title: lesson.title,
        duration: lesson.duration,
        lessonType: (lesson as any).lessonType || 'Video',
        videoURL: (lesson as any).videoURL || '',
        content: (lesson as any).content || '',
        resources: (lesson as any).resources || [],
      },
    });
    setIsEditingLesson(true);
  };

  const saveEditLesson = () => {
    if (
      !editingLesson ||
      !editingLesson.data.title.trim() ||
      editingLesson.data.duration <= 0
    ) {
      return;
    }

    // Validate based on lesson type
    if (editingLesson.data.lessonType === 'Video' && !editingLesson.data.videoURL?.trim()) {
      alert('Please enter a video URL for this video lesson');
      return;
    }

    setSections((prev) =>
      prev.map((section, sIdx) =>
        sIdx === editingLesson.sectionIndex
          ? {
              ...section,
              lessons: section.lessons.map((lesson, lIdx) =>
                lIdx === editingLesson.lessonIndex
                  ? { ...lesson, ...editingLesson.data } as LessonData
                  : lesson
              ),
            }
          : section
      )
    );
    setEditingLesson(null);
  };

  const deleteLesson = (sectionIndex: number, lessonIndex: number) => {
    if (!confirm('Delete this lesson?')) return;

    setSections((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              lessons: section.lessons
                .filter((_, lIdx) => lIdx !== lessonIndex)
                .map((lesson, lIdx) => ({ ...lesson, orderIndex: lIdx })),
            }
          : section
      )
    );
  };

  const moveLessonUp = (sectionIndex: number, lessonIndex: number) => {
    if (lessonIndex === 0) return;
    setSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        const updated = [...section.lessons];
        [updated[lessonIndex - 1], updated[lessonIndex]] = [
          updated[lessonIndex],
          updated[lessonIndex - 1],
        ];
        return {
          ...section,
          lessons: updated.map((lesson, lIdx) => ({
            ...lesson,
            orderIndex: lIdx,
          })),
        };
      })
    );
  };

  const moveLessonDown = (sectionIndex: number, lessonIndex: number) => {
    const section = sections[sectionIndex];
    if (lessonIndex === section.lessons.length - 1) return;
    setSections((prev) =>
      prev.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        const updated = [...section.lessons];
        [updated[lessonIndex], updated[lessonIndex + 1]] = [
          updated[lessonIndex + 1],
          updated[lessonIndex],
        ];
        return {
          ...section,
          lessons: updated.map((lesson, lIdx) => ({
            ...lesson,
            orderIndex: lIdx,
          })),
        };
      })
    );
  };

  const handleSubmit = () => {
    if (sections.length === 0) {
      alert('Please add at least one section');
      return;
    }

    const hasEmptySections = sections.some(
      (section) => section.lessons.length === 0
    );
    if (hasEmptySections) {
      setConfirmCallback(() => () => onSave(sections));
      setShowConfirmDialog(true);
      return;
    }

    onSave(sections);
  };

  // Helper functions for lesson data access
  const getCurrentLessonData = () => {
    return isEditingLesson ? editingLesson?.data : newLesson?.data;
  };

  const setCurrentLessonData = (data: LessonFormData) => {
    if (isEditingLesson && editingLesson) {
      setEditingLesson({ ...editingLesson, data });
    } else if (newLesson) {
      setNewLesson({ ...newLesson, data });
    }
  };

  // Resource management functions
  const addResource = () => {
    const currentData = getCurrentLessonData();
    if (!currentData) return;

    const errors: { resourceTitle?: string; resourceURL?: string } = {};

    if (!resourceForm.resourceTitle.trim()) {
      errors.resourceTitle = 'Resource title is required';
    }
    
    if (!resourceForm.resourceURL.trim()) {
      errors.resourceURL = 'Resource URL is required';
    } else if (!isValidUrl(resourceForm.resourceURL)) {
      errors.resourceURL = 'Invalid URL format. Must start with http:// or https://';
    }

    if (Object.keys(errors).length > 0) {
      setResourceFormErrors(errors);
      return;
    }

    const updatedData = {
      ...currentData,
      resources: [...(currentData.resources || []), resourceForm],
    };

    setCurrentLessonData(updatedData);
    setResourceForm({ resourceType: 'PDF', resourceTitle: '', resourceURL: '' });
    setResourceFormErrors({});
    setShowNewResourceDialog(false);
  };

  const updateResource = () => {
    const currentData = getCurrentLessonData();
    if (!currentData || editingResourceIndex === null) return;

    const errors: { resourceTitle?: string; resourceURL?: string } = {};

    if (!resourceForm.resourceTitle.trim()) {
      errors.resourceTitle = 'Resource title is required';
    }
    
    if (!resourceForm.resourceURL.trim()) {
      errors.resourceURL = 'Resource URL is required';
    } else if (!isValidUrl(resourceForm.resourceURL)) {
      errors.resourceURL = 'Invalid URL format. Must start with http:// or https://';
    }

    if (Object.keys(errors).length > 0) {
      setResourceFormErrors(errors);
      return;
    }

    const updatedResources = [...(currentData.resources || [])];
    updatedResources[editingResourceIndex] = resourceForm;

    const updatedData = {
      ...currentData,
      resources: updatedResources,
    };

    setCurrentLessonData(updatedData);
    setResourceForm({ resourceType: 'PDF', resourceTitle: '', resourceURL: '' });
    setResourceFormErrors({});
    setEditingResourceIndex(null);
    setShowEditResourceDialog(false);
  };

  const deleteResource = (index: number) => {
    const currentData = getCurrentLessonData();
    if (!currentData) return;

    const updatedData = {
      ...currentData,
      resources: currentData.resources?.filter((_, i) => i !== index) || [],
    };

    setCurrentLessonData(updatedData);
  };

  const startEditResource = (index: number) => {
    const currentData = getCurrentLessonData();
    if (!currentData || !currentData.resources) return;

    const resource = currentData.resources[index];
    setResourceForm(resource);
    setEditingResourceIndex(index);
    setShowEditResourceDialog(true);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  const getResourceIcon = (type: 'PDF' | 'ExternalLink') => {
    return type === 'PDF' ? <FileText className="w-4 h-4" /> : <Link2 className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
          <h3 className="text-lg font-semibold">Course Structure</h3>
          <p className="text-sm text-gray-500">
            Build your course with sections, lessons, and resources.
          </p>
        </div>
        <Button type="button" onClick={addSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="border rounded-lg overflow-hidden bg-white"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <button
                  type="button"
                  onClick={() => toggleSection(sectionIndex)}
                  className="flex items-center gap-2 text-left flex-1"
                >
                  {expandedSections.has(sectionIndex) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                  <div>
                    <h4 className="font-semibold">
                      Section {sectionIndex + 1}: {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {section.lessons.length} lesson(s)
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSectionUp(sectionIndex)}
                  disabled={sectionIndex === 0}
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSectionDown(sectionIndex)}
                  disabled={sectionIndex === sections.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditSection(sectionIndex)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSection(sectionIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {expandedSections.has(sectionIndex) && (
              <div className="p-4 space-y-3">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lessonIndex}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    {((lesson as any).lessonType || 'Video') === 'Reading' ? (
                      <BookOpen className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Video className="w-4 h-4 text-gray-500" />
                    )}
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{lesson.title}</h5>
                      <p className="text-xs text-gray-500">
                        {lesson.duration} minutes
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveLessonUp(sectionIndex, lessonIndex)}
                        disabled={lessonIndex === 0}
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          moveLessonDown(sectionIndex, lessonIndex)
                        }
                        disabled={lessonIndex === section.lessons.length - 1}
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          startEditLesson(sectionIndex, lessonIndex)
                        }
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLesson(sectionIndex, lessonIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLesson(sectionIndex)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lesson
                </Button>
              </div>
            )}
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 mb-4">No sections yet</p>
            <Button type="button" onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Section
            </Button>
          </div>
        )}
      </div>

      <div className={`flex pt-6 border-t ${onBack ? 'justify-between' : 'justify-end'}`}>
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button type="button" onClick={handleSubmit}>
          {submitButtonText}
        </Button>
      </div>

      <Dialog
        open={!!newSection}
        onOpenChange={(open) => !open && setNewSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>Create a new section for your course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="section-title"
                value={newSection?.title || ''}
                onChange={(e) =>
                  setNewSection((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                placeholder="e.g., Introduction to Grammar"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="section-description">Description (Optional)</Label>
              <Textarea
                id="section-description"
                value={newSection?.description || ''}
                onChange={(e) =>
                  setNewSection((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                placeholder="Brief description of this section"
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSection(null)}>
              Cancel
            </Button>
            <Button onClick={saveNewSection} disabled={!newSection?.title.trim()}>
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingSection}
        onOpenChange={(open) => !open && setEditingSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>Update section details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-section-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-section-title"
                value={editingSection?.data.title || ''}
                onChange={(e) =>
                  setEditingSection((prev) =>
                    prev
                      ? { ...prev, data: { ...prev.data, title: e.target.value } }
                      : null
                  )
                }
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-section-description">
                Description (Optional)
              </Label>
              <Textarea
                id="edit-section-description"
                value={editingSection?.data.description || ''}
                onChange={(e) =>
                  setEditingSection((prev) =>
                    prev
                      ? {
                          ...prev,
                          data: { ...prev.data, description: e.target.value },
                        }
                      : null
                  )
                }
                maxLength={500}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveEditSection}
              disabled={!editingSection?.data.title.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!newLesson || !!editingLesson}
        onOpenChange={(open) => {
          if (!open) {
            setNewLesson(null);
            setEditingLesson(null);
            setShowNewResourceDialog(false);
            setShowEditResourceDialog(false);
            setEditingResourceIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </DialogTitle>
            <DialogDescription>
              {isEditingLesson ? 'Update lesson details' : 'Create a new lesson for this section'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lesson-title"
                value={getCurrentLessonData()?.title || ''}
                onChange={(e) => {
                  const data = getCurrentLessonData();
                  if (data) {
                    setCurrentLessonData({ ...data, title: e.target.value });
                  }
                }}
                placeholder="e.g., Introduction to Present Tense"
                maxLength={100}
              />
            </div>

            <div>
              <Label>
                Lesson Type <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lesson-type"
                    value="Video"
                    checked={getCurrentLessonData()?.lessonType === 'Video'}
                    onChange={(e) => {
                      const data = getCurrentLessonData();
                      if (data) {
                        setCurrentLessonData({
                          ...data,
                          lessonType: e.target.value as 'Video' | 'Reading',
                        });
                      }
                    }}
                  />
                  <span className="text-sm">Video Lesson</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lesson-type"
                    value="Reading"
                    checked={getCurrentLessonData()?.lessonType === 'Reading'}
                    onChange={(e) => {
                      const data = getCurrentLessonData();
                      if (data) {
                        setCurrentLessonData({
                          ...data,
                          lessonType: e.target.value as 'Video' | 'Reading',
                        });
                      }
                    }}
                  />
                  <span className="text-sm">Reading Lesson</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="lesson-duration">
                Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lesson-duration"
                type="number"
                min="1"
                max="600"
                value={getCurrentLessonData()?.duration || ''}
                onChange={(e) => {
                  const data = getCurrentLessonData();
                  if (data) {
                    setCurrentLessonData({
                      ...data,
                      duration: Number(e.target.value),
                    });
                  }
                }}
                placeholder="e.g., 30"
              />
            </div>

            {getCurrentLessonData()?.lessonType === 'Video' && (
              <div>
                <Label htmlFor="lesson-video-url">
                  Video URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lesson-video-url"
                  value={getCurrentLessonData()?.videoURL || ''}
                  onChange={(e) => {
                    const data = getCurrentLessonData();
                    if (data) {
                      setCurrentLessonData({ ...data, videoURL: e.target.value });
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {getCurrentLessonData()?.videoURL && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(getCurrentLessonData()!.videoURL!)}
                        className="w-full h-full rounded"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {getCurrentLessonData()?.lessonType === 'Reading' && (
              <div>
                <Label htmlFor="lesson-content">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="lesson-content"
                  value={getCurrentLessonData()?.content || ''}
                  onChange={(e) => {
                    const data = getCurrentLessonData();
                    if (data) {
                      setCurrentLessonData({ ...data, content: e.target.value });
                    }
                  }}
                  placeholder="Enter lesson content here..."
                  className="min-h-[200px]"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Resources</Label>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setResourceForm({
                      resourceType: 'PDF',
                      resourceTitle: '',
                      resourceURL: '',
                    });
                    setResourceFormErrors({});
                    setShowNewResourceDialog(true);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </div>

              {(getCurrentLessonData()?.resources || []).length > 0 && (
                <div className="space-y-2 bg-gray-50 p-3 rounded">
                  {getCurrentLessonData()?.resources?.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {getResourceIcon(resource.resourceType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {resource.resourceTitle}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {resource.resourceType}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditResource(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteResource(index)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewLesson(null);
                setEditingLesson(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditingLesson ? saveEditLesson : saveNewLesson}
              disabled={
                !getCurrentLessonData()?.title.trim() ||
                (getCurrentLessonData()?.duration || 0) <= 0 ||
                (getCurrentLessonData()?.lessonType === 'Video' &&
                  !getCurrentLessonData()?.videoURL?.trim()) ||
                (getCurrentLessonData()?.lessonType === 'Reading' &&
                  !getCurrentLessonData()?.content?.trim())
              }
            >
              {isEditingLesson ? 'Save Changes' : 'Add Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNewResourceDialog}
        onOpenChange={setShowNewResourceDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resource Type</Label>
              <Select
                value={resourceForm.resourceType}
                onValueChange={(value) =>
                  setResourceForm({
                    ...resourceForm,
                    resourceType: value as 'PDF' | 'ExternalLink',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="ExternalLink">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resource-title">Title</Label>
              <Input
                id="resource-title"
                value={resourceForm.resourceTitle}
                onChange={(e) => {
                  setResourceForm({
                    ...resourceForm,
                    resourceTitle: e.target.value,
                  });
                  if (resourceFormErrors.resourceTitle) {
                    setResourceFormErrors({ ...resourceFormErrors, resourceTitle: undefined });
                  }
                }}
                placeholder="e.g., Grammar Guide"
                className={resourceFormErrors.resourceTitle ? 'border-red-500' : ''}
              />
              {resourceFormErrors.resourceTitle && (
                <p className="text-sm text-red-500 mt-1">{resourceFormErrors.resourceTitle}</p>
              )}
            </div>
            <div>
              <Label htmlFor="resource-url">
                {resourceForm.resourceType === 'PDF'
                  ? 'PDF URL'
                  : 'Link URL'}
              </Label>
              <Input
                id="resource-url"
                value={resourceForm.resourceURL}
                onChange={(e) => {
                  setResourceForm({
                    ...resourceForm,
                    resourceURL: e.target.value,
                  });
                  if (resourceFormErrors.resourceURL) {
                    setResourceFormErrors({ ...resourceFormErrors, resourceURL: undefined });
                  }
                }}
                placeholder={
                  resourceForm.resourceType === 'PDF'
                    ? 'https://example.com/file.pdf'
                    : 'https://example.com'
                }
                className={resourceFormErrors.resourceURL ? 'border-red-500' : ''}
              />
              {resourceFormErrors.resourceURL && (
                <p className="text-sm text-red-500 mt-1">{resourceFormErrors.resourceURL}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewResourceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={addResource}
              disabled={
                !resourceForm.resourceTitle.trim() ||
                !resourceForm.resourceURL.trim()
              }
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditResourceDialog}
        onOpenChange={setShowEditResourceDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resource Type</Label>
              <Select
                value={resourceForm.resourceType}
                onValueChange={(value) =>
                  setResourceForm({
                    ...resourceForm,
                    resourceType: value as 'PDF' | 'ExternalLink',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="ExternalLink">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-resource-title">Title</Label>
              <Input
                id="edit-resource-title"
                value={resourceForm.resourceTitle}
                onChange={(e) => {
                  setResourceForm({
                    ...resourceForm,
                    resourceTitle: e.target.value,
                  });
                  if (resourceFormErrors.resourceTitle) {
                    setResourceFormErrors({ ...resourceFormErrors, resourceTitle: undefined });
                  }
                }}
                placeholder="e.g., Grammar Guide"
                className={resourceFormErrors.resourceTitle ? 'border-red-500' : ''}
              />
              {resourceFormErrors.resourceTitle && (
                <p className="text-sm text-red-500 mt-1">{resourceFormErrors.resourceTitle}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-resource-url">
                {resourceForm.resourceType === 'PDF'
                  ? 'PDF URL'
                  : 'Link URL'}
              </Label>
              <Input
                id="edit-resource-url"
                value={resourceForm.resourceURL}
                onChange={(e) => {
                  setResourceForm({
                    ...resourceForm,
                    resourceURL: e.target.value,
                  });
                  if (resourceFormErrors.resourceURL) {
                    setResourceFormErrors({ ...resourceFormErrors, resourceURL: undefined });
                  }
                }}
                placeholder={
                  resourceForm.resourceType === 'PDF'
                    ? 'https://example.com/file.pdf'
                    : 'https://example.com'
                }
                className={resourceFormErrors.resourceURL ? 'border-red-500' : ''}
              />
              {resourceFormErrors.resourceURL && (
                <p className="text-sm text-red-500 mt-1">{resourceFormErrors.resourceURL}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditResourceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={updateResource}
              disabled={
                !resourceForm.resourceTitle.trim() ||
                !resourceForm.resourceURL.trim()
              }
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Continue with empty sections?</DialogTitle>
            <DialogDescription>
              Some sections have no lessons. You can add lessons later, or continue creating the course now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmCallback) {
                  confirmCallback();
                }
                setShowConfirmDialog(false);
                setConfirmCallback(null);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
} from 'lucide-react';
import { SectionData, LessonData } from '@/queries/course-api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Step2Props {
  sections: SectionData[];
  onSave: (sections: SectionData[]) => void;
  onBack: () => void;
}

interface SectionFormData {
  title: string;
  description: string;
}

interface LessonFormData {
  title: string;
  duration_minutes: number;
  video_url: string;
}

export function Step2CourseContent({ sections: initialSections, onSave, onBack }: Step2Props) {
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
        order_index: prev.length,
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
        order_index: idx,
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
        order_index: idx,
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
        order_index: idx,
      }));
    });
  };

  const addLesson = (sectionIndex: number) => {
    setNewLesson({
      sectionIndex,
      data: { title: '', duration_minutes: 0, video_url: '' },
    });
  };

  const saveNewLesson = () => {
    if (
      !newLesson ||
      !newLesson.data.title.trim() ||
      !newLesson.data.video_url.trim() ||
      newLesson.data.duration_minutes <= 0
    ) {
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
                  order_index: section.lessons.length,
                },
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
        duration_minutes: lesson.duration_minutes,
        video_url: lesson.video_url,
      },
    });
  };

  const saveEditLesson = () => {
    if (
      !editingLesson ||
      !editingLesson.data.title.trim() ||
      !editingLesson.data.video_url.trim() ||
      editingLesson.data.duration_minutes <= 0
    ) {
      return;
    }

    setSections((prev) =>
      prev.map((section, sIdx) =>
        sIdx === editingLesson.sectionIndex
          ? {
              ...section,
              lessons: section.lessons.map((lesson, lIdx) =>
                lIdx === editingLesson.lessonIndex
                  ? { ...lesson, ...editingLesson.data }
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
                .map((lesson, lIdx) => ({ ...lesson, order_index: lIdx })),
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
            order_index: lIdx,
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
            order_index: lIdx,
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
      if (
        !confirm(
          'Some sections have no lessons. Continue anyway?'
        )
      ) {
        return;
      }
    }

    onSave(sections);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Structure</h3>
          <p className="text-sm text-gray-500">
            Build your course with sections and lessons
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
                    <Video className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{lesson.title}</h5>
                      <p className="text-xs text-gray-500">
                        {lesson.duration_minutes} minutes
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

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Create Course
        </Button>
      </div>

      <Dialog
        open={!!newSection}
        onOpenChange={(open) => !open && setNewSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
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
        open={!!newLesson}
        onOpenChange={(open) => !open && setNewLesson(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lesson-title"
                value={newLesson?.data.title || ''}
                onChange={(e) =>
                  setNewLesson((prev) =>
                    prev
                      ? { ...prev, data: { ...prev.data, title: e.target.value } }
                      : null
                  )
                }
                placeholder="e.g., Introduction to Present Tense"
                maxLength={100}
              />
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
                value={newLesson?.data.duration_minutes || ''}
                onChange={(e) =>
                  setNewLesson((prev) =>
                    prev
                      ? {
                          ...prev,
                          data: {
                            ...prev.data,
                            duration_minutes: Number(e.target.value),
                          },
                        }
                      : null
                  )
                }
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <Label htmlFor="lesson-video-url">
                Video URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lesson-video-url"
                value={newLesson?.data.video_url || ''}
                onChange={(e) =>
                  setNewLesson((prev) =>
                    prev
                      ? {
                          ...prev,
                          data: { ...prev.data, video_url: e.target.value },
                        }
                      : null
                  )
                }
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {newLesson?.data.video_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(newLesson.data.video_url)}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewLesson(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveNewLesson}
              disabled={
                !newLesson?.data.title.trim() ||
                !newLesson?.data.video_url.trim() ||
                (newLesson?.data.duration_minutes || 0) <= 0
              }
            >
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingLesson}
        onOpenChange={(open) => !open && setEditingLesson(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-lesson-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-lesson-title"
                value={editingLesson?.data.title || ''}
                onChange={(e) =>
                  setEditingLesson((prev) =>
                    prev
                      ? { ...prev, data: { ...prev.data, title: e.target.value } }
                      : null
                  )
                }
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-duration">
                Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-lesson-duration"
                type="number"
                min="1"
                max="600"
                value={editingLesson?.data.duration_minutes || ''}
                onChange={(e) =>
                  setEditingLesson((prev) =>
                    prev
                      ? {
                          ...prev,
                          data: {
                            ...prev.data,
                            duration_minutes: Number(e.target.value),
                          },
                        }
                      : null
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-video-url">
                Video URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-lesson-video-url"
                value={editingLesson?.data.video_url || ''}
                onChange={(e) =>
                  setEditingLesson((prev) =>
                    prev
                      ? {
                          ...prev,
                          data: { ...prev.data, video_url: e.target.value },
                        }
                      : null
                  )
                }
              />
              {editingLesson?.data.video_url && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(editingLesson.data.video_url)}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLesson(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveEditLesson}
              disabled={
                !editingLesson?.data.title.trim() ||
                !editingLesson?.data.video_url.trim() ||
                (editingLesson?.data.duration_minutes || 0) <= 0
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

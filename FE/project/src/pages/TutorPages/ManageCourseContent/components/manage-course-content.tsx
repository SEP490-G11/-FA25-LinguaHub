import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  FileText,
  Link2,
} from 'lucide-react';
import { CourseDetail, Section, Lesson, Resource } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ManageCourseContentProps {
  course: CourseDetail;
  onUpdateSection: (sectionIndex: number, section: Section) => void;
  onUpdateLesson: (sectionIndex: number, lessonIndex: number, lesson: Lesson) => void;
  onUpdateResource: (sectionIndex: number, lessonIndex: number, resourceIndex: number, resource: Resource) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onDeleteLesson: (sectionIndex: number, lessonIndex: number) => void;
  onDeleteResource: (sectionIndex: number, lessonIndex: number, resourceIndex: number) => void;
  onBack: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

interface SectionFormData {
  title: string;
  description: string;
  orderIndex: number;
}

interface LessonFormData {
  title: string;
  duration: number;
  lessonType: string;
  videoURL: string;
  content: string;
  orderIndex: number;
}

interface ResourceFormData {
  resourceType: string;
  resourceTitle: string;
  resourceURL: string;
}

export default function ManageCourseContentComponent({
  course,
  onUpdateSection,
  onUpdateLesson,
  onUpdateResource,
  onDeleteSection,
  onDeleteLesson,
  onDeleteResource,
  onBack,
  onComplete,
  isSubmitting,
}: ManageCourseContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [expandedLessons, setExpandedLessons] = useState<Map<string, boolean>>(new Map());

  // Edit section dialog
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<SectionFormData | null>(null);

  // Edit lesson dialog
  const [editingLessonKey, setEditingLessonKey] = useState<string | null>(null);
  const [editingLessonData, setEditingLessonData] = useState<LessonFormData | null>(null);

  // Edit resource dialog
  const [editingResourceKey, setEditingResourceKey] = useState<string | null>(null);
  const [editingResourceData, setEditingResourceData] = useState<ResourceFormData | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'section' | 'lesson' | 'resource';
    sectionIndex: number;
    lessonIndex?: number;
    resourceIndex?: number;
  } | null>(null);

  // Toggle section expand
  const toggleSection = (index: number) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedSections(newSet);
  };

  // Toggle lesson expand
  const toggleLesson = (sectionIndex: number, lessonIndex: number) => {
    const key = `${sectionIndex}-${lessonIndex}`;
    const newMap = new Map(expandedLessons);
    if (newMap.has(key)) {
      newMap.delete(key);
    } else {
      newMap.set(key, true);
    }
    setExpandedLessons(newMap);
  };

  // Handle edit section
  const handleEditSection = (sectionIndex: number, section: Section) => {
    setEditingSectionIndex(sectionIndex);
    setEditingSectionData({
      title: section.title,
      description: section.description,
      orderIndex: section.orderIndex,
    });
  };

  const handleSaveEditSection = () => {
    if (!editingSectionData || editingSectionIndex === null) return;

    const section = course.section[editingSectionIndex];
    onUpdateSection(editingSectionIndex, {
      ...section,
      ...editingSectionData,
    });

    setEditingSectionIndex(null);
    setEditingSectionData(null);
  };

  // Handle edit lesson
  const handleEditLesson = (sectionIndex: number, lessonIndex: number, lesson: Lesson) => {
    setEditingLessonKey(`${sectionIndex}-${lessonIndex}`);
    setEditingLessonData({
      title: lesson.title,
      duration: lesson.duration,
      lessonType: lesson.lessonType,
      videoURL: lesson.videoURL || '',
      content: lesson.content || '',
      orderIndex: lesson.orderIndex,
    });
  };

  const handleSaveEditLesson = () => {
    if (!editingLessonData || !editingLessonKey) return;

    const [sectionIndex, lessonIndex] = editingLessonKey.split('-').map(Number);
    const lesson = course.section[sectionIndex].lessons[lessonIndex];

    const updatedLesson: Lesson = {
      ...lesson,
      title: editingLessonData.title,
      duration: editingLessonData.duration,
      lessonType: editingLessonData.lessonType as 'Video' | 'Reading',
      videoURL: editingLessonData.videoURL,
      content: editingLessonData.content,
      orderIndex: editingLessonData.orderIndex,
    };

    onUpdateLesson(sectionIndex, lessonIndex, updatedLesson);

    setEditingLessonKey(null);
    setEditingLessonData(null);
  };

  // Handle edit resource
  const handleEditResource = (sectionIndex: number, lessonIndex: number, resourceIndex: number, resource: Resource) => {
    setEditingResourceKey(`${sectionIndex}-${lessonIndex}-${resourceIndex}`);
    setEditingResourceData({
      resourceType: resource.resourceType,
      resourceTitle: resource.resourceTitle,
      resourceURL: resource.resourceURL,
    });
  };

  const handleSaveEditResource = () => {
    if (!editingResourceData || !editingResourceKey) return;

    const [sectionIndex, lessonIndex, resourceIndex] = editingResourceKey.split('-').map(Number);
    const resource = course.section[sectionIndex].lessons[lessonIndex].resources[resourceIndex];

    const updatedResource: Resource = {
      ...resource,
      resourceType: editingResourceData.resourceType as 'PDF' | 'Video' | 'ExternalLink' | 'Document',
      resourceTitle: editingResourceData.resourceTitle,
      resourceURL: editingResourceData.resourceURL,
    };

    onUpdateResource(sectionIndex, lessonIndex, resourceIndex, updatedResource);

    setEditingResourceKey(null);
    setEditingResourceData(null);
  };

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4" />;
      case 'ExternalLink':
        return <Link2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sections List */}
      {course.section && Array.isArray(course.section) && course.section.length > 0 ? (
        <div className="space-y-4">
          {course.section.map((section, sectionIndex) => (
            <Card key={section.sectionID}>
              <CardContent className="p-0">
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleSection(sectionIndex)}
                      className="p-1 hover:bg-blue-200 rounded transition"
                    >
                      {expandedSections.has(sectionIndex) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {section.orderIndex}. {section.title}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditSection(sectionIndex, section)}
                      disabled={isSubmitting}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm({ type: 'section', sectionIndex })}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(sectionIndex) && (
                  <div className="p-4 space-y-4">
                    {section.lessons && section.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const lessonKey = `${sectionIndex}-${lessonIndex}`;
                          const isExpanded = expandedLessons.get(lessonKey);

                          return (
                            <div key={lesson.lessonID} className="border rounded-lg bg-gray-50">
                              {/* Lesson Header */}
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent">
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleLesson(sectionIndex, lessonIndex)}
                                    className="p-1 hover:bg-purple-200 rounded transition"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                      {lesson.orderIndex}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {lesson.duration} phút • {lesson.lessonType}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditLesson(sectionIndex, lessonIndex, lesson)}
                                    disabled={isSubmitting}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDeleteConfirm({ type: 'lesson', sectionIndex, lessonIndex })}
                                    disabled={isSubmitting}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>

                              {/* Lesson Content */}
                              {isExpanded && (
                                <div className="p-3 border-t space-y-3">
                                  {/* Resources */}
                                  {lesson.resources && lesson.resources.length > 0 && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 mb-2">📎 Tài liệu:</p>
                                      <div className="space-y-2 ml-4">
                                        {lesson.resources.map((resource, resourceIndex) => (
                                          <div key={resource.resourceID} className="flex items-center justify-between p-2 bg-white rounded border">
                                            <div className="flex items-center gap-2">
                                              {getResourceIcon(resource.resourceType)}
                                              <div>
                                                <p className="text-sm font-medium">{resource.resourceTitle}</p>
                                                <p className="text-xs text-gray-500">{resource.resourceType}</p>
                                              </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                  handleEditResource(
                                                    sectionIndex,
                                                    lessonIndex,
                                                    resourceIndex,
                                                    resource
                                                  )
                                                }
                                                disabled={isSubmitting}
                                              >
                                                <Edit2 className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                  setDeleteConfirm({
                                                    type: 'resource',
                                                    sectionIndex,
                                                    lessonIndex,
                                                    resourceIndex,
                                                  })
                                                }
                                                disabled={isSubmitting}
                                              >
                                                <Trash2 className="w-3 h-3 text-red-500" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-4">Chương này chưa có bài học nào</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Khóa học này chưa có nội dung nào</p>
          </div>
        </Card>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Quay lại
        </Button>
        <Button onClick={onComplete} disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Hoàn thành'}
        </Button>
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={editingSectionIndex !== null} onOpenChange={(open) => !open && setEditingSectionIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chương</DialogTitle>
          </DialogHeader>
          {editingSectionData && (
            <div className="space-y-4">
              <div>
                <Label>Tên chương</Label>
                <Input
                  value={editingSectionData.title}
                  onChange={(e) =>
                    setEditingSectionData({ ...editingSectionData, title: e.target.value })
                  }
                  placeholder="e.g., Introduction"
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={editingSectionData.description}
                  onChange={(e) =>
                    setEditingSectionData({ ...editingSectionData, description: e.target.value })
                  }
                  placeholder="Mô tả chương..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Thứ tự</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingSectionData.orderIndex}
                  onChange={(e) =>
                    setEditingSectionData({ ...editingSectionData, orderIndex: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSectionIndex(null)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEditSection} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={editingLessonKey !== null} onOpenChange={(open) => !open && setEditingLessonKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài học</DialogTitle>
          </DialogHeader>
          {editingLessonData && (
            <div className="space-y-4">
              <div>
                <Label>Tên bài học</Label>
                <Input
                  value={editingLessonData.title}
                  onChange={(e) =>
                    setEditingLessonData({ ...editingLessonData, title: e.target.value })
                  }
                  placeholder="e.g., Lesson 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thời lượng (phút)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingLessonData.duration}
                    onChange={(e) =>
                      setEditingLessonData({ ...editingLessonData, duration: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Loại</Label>
                  <Select value={editingLessonData.lessonType} onValueChange={(value) =>
                    setEditingLessonData({ ...editingLessonData, lessonType: value })
                  }>
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
              {editingLessonData.lessonType === 'Video' && (
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={editingLessonData.videoURL}
                    onChange={(e) =>
                      setEditingLessonData({ ...editingLessonData, videoURL: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
              {editingLessonData.lessonType === 'Reading' && (
                <div>
                  <Label>Nội dung</Label>
                  <Textarea
                    value={editingLessonData.content}
                    onChange={(e) =>
                      setEditingLessonData({ ...editingLessonData, content: e.target.value })
                    }
                    placeholder="Nội dung bài học..."
                    rows={3}
                  />
                </div>
              )}
              <div>
                <Label>Thứ tự</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingLessonData.orderIndex}
                  onChange={(e) =>
                    setEditingLessonData({ ...editingLessonData, orderIndex: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLessonKey(null)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEditLesson} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={editingResourceKey !== null} onOpenChange={(open) => !open && setEditingResourceKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
          </DialogHeader>
          {editingResourceData && (
            <div className="space-y-4">
              <div>
                <Label>Loại tài liệu</Label>
                <Select value={editingResourceData.resourceType} onValueChange={(value) =>
                  setEditingResourceData({ ...editingResourceData, resourceType: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="ExternalLink">External Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tên tài liệu</Label>
                <Input
                  value={editingResourceData.resourceTitle}
                  onChange={(e) =>
                    setEditingResourceData({ ...editingResourceData, resourceTitle: e.target.value })
                  }
                  placeholder="e.g., Study Guide"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={editingResourceData.resourceURL}
                  onChange={(e) =>
                    setEditingResourceData({ ...editingResourceData, resourceURL: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingResourceKey(null)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEditResource} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Xóa không?</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteConfirm?.type === 'section' && 'Chương này và tất cả bài học sẽ bị xóa vĩnh viễn.'}
            {deleteConfirm?.type === 'lesson' && 'Bài học này và tất cả tài liệu sẽ bị xóa vĩnh viễn.'}
            {deleteConfirm?.type === 'resource' && 'Tài liệu này sẽ bị xóa vĩnh viễn.'}
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'section') {
                  onDeleteSection(deleteConfirm.sectionIndex);
                } else if (deleteConfirm?.type === 'lesson') {
                  onDeleteLesson(deleteConfirm.sectionIndex, deleteConfirm.lessonIndex!);
                } else if (deleteConfirm?.type === 'resource') {
                  onDeleteResource(deleteConfirm.sectionIndex, deleteConfirm.lessonIndex!, deleteConfirm.resourceIndex!);
                }
                setDeleteConfirm(null);
              }}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

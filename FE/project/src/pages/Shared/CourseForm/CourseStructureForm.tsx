import { useState, useEffect, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
} from 'lucide-react';

export interface SectionData {
  sectionID?: string;
  courseID?: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: LessonData[];
}

export interface LessonData {
  lessonID?: string;
  sectionID?: string;
  title: string;
  duration: number;
  lessonType: 'Video' | 'Reading';
  videoURL?: string;
  content?: string;
  orderIndex: number;
  resources?: ResourceData[];
}

export interface ResourceData {
  resourceID?: string;
  lessonID?: string;
  resourceType: 'PDF' | 'Video' | 'ExternalLink' | 'Document';
  resourceTitle: string;
  resourceURL: string;
  uploadedAt?: string;
}

interface CourseStructureFormProps {
  sections: SectionData[];
  onSave: (sections: SectionData[]) => void;
  onBack: () => void;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  onAddSection?: (sectionData: SectionData) => Promise<SectionData>;
  onUpdateSection?: (sectionID: string, sectionData: SectionData) => Promise<SectionData>;
  onDeleteSection?: (sectionID: string) => Promise<void>;
  onAddLesson?: (sectionID: string, lessonData: LessonData) => Promise<LessonData>;
  onUpdateLesson?: (lessonID: string, lessonData: LessonData) => Promise<LessonData>;
  onDeleteLesson?: (lessonID: string) => Promise<void>;
  onAddResource?: (lessonID: string, resourceData: ResourceData) => Promise<ResourceData>;
  onUpdateResource?: (resourceID: string, resourceData: ResourceData) => Promise<ResourceData>;
  onDeleteResource?: (resourceID: string) => Promise<void>;
}

interface ExpandState {
  sections: Set<number>;
  lessons: Map<string, Set<number>>;
}

export function CourseStructureForm({
  sections: initialSections,
  onSave,
  onBack,
  mode,
  isLoading = false,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}: CourseStructureFormProps) {
  const [sections, setSections] = useState<SectionData[]>(initialSections);
  const [expandState, setExpandState] = useState<ExpandState>({
    sections: new Set([0]),
    lessons: new Map(),
  });
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Track newly created sections by their index to sectionID mapping
  // This helps us find the sectionID when creating lessons immediately after section creation
  const newlySectionSectionIDs = useRef<Map<number, string>>(new Map());

  // Sync initial sections prop with local state when it changes
  useEffect(() => {
    console.log('=== SYNC SECTIONS FROM PROP ===', { count: initialSections.length });
    setSections(initialSections);
    // Clear the newly created IDs map when prop syncs, as these are now in the main state
    newlySectionSectionIDs.current.clear();
  }, [initialSections]);

  const [editingDialog, setEditingDialog] = useState<{
    type: 'section' | 'lesson' | 'resource' | null;
    sectionIndex: number | null;
    lessonIndex: number | null;
    data: Partial<SectionData & LessonData & ResourceData> | null;
  }>({
    type: null,
    sectionIndex: null,
    lessonIndex: null,
    data: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: 'section' | 'lesson' | 'resource' | null;
    sectionIndex: number | null;
    lessonIndex: number | null;
    resourceIndex?: number;
  }>({
    show: false,
    type: null,
    sectionIndex: null,
    lessonIndex: null,
  });

  // Toggle section expand/collapse
  const toggleSection = (index: number) => {
    setExpandState((prev) => {
      const newSections = new Set(prev.sections);
      if (newSections.has(index)) {
        newSections.delete(index);
      } else {
        newSections.add(index);
      }
      return { ...prev, sections: newSections };
    });
  };

  // Toggle lesson expand/collapse
  const toggleLesson = (sectionIndex: number, lessonIndex: number) => {
    setExpandState((prev) => {
      const key = `${sectionIndex}`;
      const newLessons = new Map(prev.lessons);
      const sectionLessons = newLessons.get(key) || new Set();

      if (sectionLessons.has(lessonIndex)) {
        sectionLessons.delete(lessonIndex);
      } else {
        sectionLessons.add(lessonIndex);
      }

      newLessons.set(key, sectionLessons);
      return { ...prev, lessons: newLessons };
    });
  };

  // Add/Edit handlers
  const handleAddSection = () => {
    setEditingDialog({
      type: 'section',
      sectionIndex: null,
      lessonIndex: null,
      data: { title: '', description: '' },
    });
  };

  const handleEditSection = (index: number) => {
    setEditingDialog({
      type: 'section',
      sectionIndex: index,
      lessonIndex: null,
      data: { ...sections[index] },
    });
  };

  const handleAddLesson = (sectionIndex: number) => {
    setEditingDialog({
      type: 'lesson',
      sectionIndex,
      lessonIndex: null,
      data: { title: '', duration: 30, lessonType: 'Video' as const },
    });
  };

  const handleEditLesson = (sectionIndex: number, lessonIndex: number) => {
    setEditingDialog({
      type: 'lesson',
      sectionIndex,
      lessonIndex,
      data: { ...sections[sectionIndex].lessons[lessonIndex] },
    });
  };

  const handleAddResource = (sectionIndex: number, lessonIndex: number) => {
    setEditingDialog({
      type: 'resource',
      sectionIndex,
      lessonIndex,
      data: { resourceType: 'PDF' as const, resourceTitle: '', resourceURL: '' },
    });
  };

  // Save handlers
  const handleSaveDialog = async () => {
    if (!editingDialog.data) return;

    setIsApiLoading(true);
    try {
      console.log('=== SAVE DIALOG START ===', {
        type: editingDialog.type,
        sectionIndex: editingDialog.sectionIndex,
        lessonIndex: editingDialog.lessonIndex,
      });

      if (editingDialog.type === 'section') {
        if (editingDialog.sectionIndex === null) {
          // Add new section - call API callback if available
          const newSection: SectionData = {
            title: editingDialog.data.title as string,
            description: editingDialog.data.description as string,
            orderIndex: sections.length,
            lessons: [],
          };
          
          console.log('=== CREATE SECTION ===', { hasCallback: !!onAddSection });
          let sectionToAdd = newSection;
          if (onAddSection) {
            try {
              const result = await onAddSection(newSection);
              console.log('=== SECTION CREATED ===', { sectionID: result?.sectionID, resultFull: result });
              sectionToAdd = result || newSection;
              
              // Store the newly created section ID so we can use it for lesson creation
              // Index will be sections.length (where this section will be added)
              if (sectionToAdd.sectionID) {
                newlySectionSectionIDs.current.set(sections.length, sectionToAdd.sectionID);
                console.log('=== STORED NEW SECTION ID ===', { index: sections.length, sectionID: sectionToAdd.sectionID });
              }
            } catch (err) {
              console.error('=== ERROR CREATING SECTION ===', err);
              throw err;
            }
          }
          
          const newSections = [...sections, sectionToAdd];
          console.log('=== BEFORE setSections ===', { 
            sectionCount: newSections.length,
            sectionToAdd 
          });
          setSections(newSections);
          console.log('=== SECTION ADDED TO LOCAL STATE ===', { newSectionsLength: newSections.length });
        } else {
          // Edit existing section - call API callback if available
          const sectionID = sections[editingDialog.sectionIndex].sectionID;
          console.log('=== UPDATE SECTION ===', { sectionID, hasCallback: !!onUpdateSection });
          
          if (sectionID && onUpdateSection) {
            const updatedSection: SectionData = {
              ...sections[editingDialog.sectionIndex],
              title: editingDialog.data.title as string,
              description: editingDialog.data.description as string,
            };
            await onUpdateSection(sectionID, updatedSection);
            console.log('=== SECTION UPDATED ===');
          }
          
          const newSections = [...sections];
          newSections[editingDialog.sectionIndex] = {
            ...newSections[editingDialog.sectionIndex],
            title: editingDialog.data.title as string,
            description: editingDialog.data.description as string,
          };
          setSections(newSections);
        }
      } else if (editingDialog.type === 'lesson') {
        console.log('=== LESSON TYPE ===', {
          lessonIndex: editingDialog.lessonIndex,
          sectionIndex: editingDialog.sectionIndex,
          isNewLesson: editingDialog.lessonIndex === null,
        });
        
        if (editingDialog.lessonIndex === null && editingDialog.sectionIndex !== null) {
          // Add new lesson - call API callback if available
          const newLesson: LessonData = {
            title: editingDialog.data.title as string,
            duration: editingDialog.data.duration as number,
            lessonType: editingDialog.data.lessonType as 'Video' | 'Reading',
            videoURL: editingDialog.data.videoURL as string,
            content: editingDialog.data.content as string,
            orderIndex: sections[editingDialog.sectionIndex].lessons.length,
            resources: [],
          };
          
          console.log('=== CREATE LESSON ===', { 
            sectionID: sections[editingDialog.sectionIndex].sectionID,
            sectionIndex: editingDialog.sectionIndex,
            hasCallback: !!onAddLesson 
          });
          
          let lessonToAdd = newLesson;
          if (onAddLesson) {
            try {
              // Check if this is a newly created section (stored in ref) or existing section
              let sectionID = sections[editingDialog.sectionIndex].sectionID;
              if (!sectionID && editingDialog.sectionIndex !== null) {
                sectionID = newlySectionSectionIDs.current.get(editingDialog.sectionIndex);
                console.log('=== FOUND SECTION ID IN NEWLY CREATED MAP ===', { sectionID, sectionIndex: editingDialog.sectionIndex });
              }
              
              if (!sectionID) {
                throw new Error('Section ID is required');
              }
              
              console.log('=== CALLING onAddLesson ===', { sectionID, lessonTitle: newLesson.title });
              const result = await onAddLesson(sectionID, newLesson);
              console.log('=== LESSON CREATED ===', { lessonID: result?.lessonID, resultFull: result });
              // Use updated lesson data with new lessonID from API
              lessonToAdd = result || newLesson;
            } catch (err) {
              console.error('=== ERROR CREATING LESSON ===', err);
              throw err;
            }
          }
          
          const newSections = [...sections];
          newSections[editingDialog.sectionIndex].lessons.push(lessonToAdd);
          console.log('=== BEFORE setSections ===', { 
            sectionIndex: editingDialog.sectionIndex,
            lessonCount: newSections[editingDialog.sectionIndex].lessons.length,
            lessonToAdd 
          });
          setSections(newSections);
          console.log('=== LESSON ADDED TO LOCAL STATE ===', { 
            newSectionsLength: newSections.length,
            newLessonsLength: newSections[editingDialog.sectionIndex].lessons.length 
          });
        } else if (editingDialog.lessonIndex !== null && editingDialog.sectionIndex !== null) {
          // Edit existing lesson - call API callback if available
          const lesson = sections[editingDialog.sectionIndex].lessons[editingDialog.lessonIndex];
          const lessonID = lesson.lessonID;
          console.log('=== UPDATE LESSON ===', { lessonID, hasCallback: !!onUpdateLesson });
          
          if (lessonID && onUpdateLesson) {
            const updatedLesson: LessonData = {
              ...lesson,
              title: editingDialog.data.title as string,
              duration: editingDialog.data.duration as number,
              lessonType: editingDialog.data.lessonType as 'Video' | 'Reading',
              videoURL: editingDialog.data.videoURL as string,
              content: editingDialog.data.content as string,
            };
            await onUpdateLesson(lessonID, updatedLesson);
            console.log('=== LESSON UPDATED ===');
          }
          
          const newSections = [...sections];
          newSections[editingDialog.sectionIndex].lessons[editingDialog.lessonIndex] = {
            ...newSections[editingDialog.sectionIndex].lessons[editingDialog.lessonIndex],
            title: editingDialog.data.title as string,
            duration: editingDialog.data.duration as number,
            lessonType: editingDialog.data.lessonType as 'Video' | 'Reading',
            videoURL: editingDialog.data.videoURL as string,
            content: editingDialog.data.content as string,
          };
          setSections(newSections);
        }
      } else if (editingDialog.type === 'resource') {
        if (editingDialog.sectionIndex !== null && editingDialog.lessonIndex !== null) {
          const lesson = sections[editingDialog.sectionIndex].lessons[editingDialog.lessonIndex];
          const newSections = [...sections];
          const resource: ResourceData = {
            resourceType: editingDialog.data.resourceType as ResourceData['resourceType'],
            resourceTitle: editingDialog.data.resourceTitle as string,
            resourceURL: editingDialog.data.resourceURL as string,
          };

          if (
            editingDialog.lessonIndex >= 0 &&
            !newSections[editingDialog.sectionIndex].lessons[
              editingDialog.lessonIndex
            ].resources
          ) {
            newSections[editingDialog.sectionIndex].lessons[
              editingDialog.lessonIndex
            ].resources = [];
          }

          // Check if this is a new resource (no resourceID)
          const isNewResource = !resource.resourceID;
          
          let resourceToAdd = resource;
          if (isNewResource && onAddResource) {
            console.log('=== CREATE RESOURCE ===', { 
              lessonID: lesson.lessonID,
              hasCallback: !!onAddResource 
            });
            
            if (!lesson.lessonID) {
              throw new Error('Lesson ID is required');
            }
            
            const result = await onAddResource(lesson.lessonID, resource);
            console.log('=== RESOURCE CREATED ===', { resourceID: result?.resourceID, resultFull: result });
            // Use updated resource data with new resourceID from API
            resourceToAdd = result || resource;
          }

          if (editingDialog.lessonIndex >= 0) {
            newSections[editingDialog.sectionIndex].lessons[
              editingDialog.lessonIndex
            ].resources?.push(resourceToAdd);
            console.log('=== RESOURCE ADDED TO LOCAL STATE ===', { 
              resourceCount: newSections[editingDialog.sectionIndex].lessons[editingDialog.lessonIndex].resources?.length 
            });
          }
          setSections(newSections);
        }
      }

      setEditingDialog({ type: null, sectionIndex: null, lessonIndex: null, data: null });
      console.log('=== SAVE DIALOG COMPLETE ===');
    } catch (error) {
      console.error('=== ERROR SAVING ===', error);
    } finally {
      console.log('=== FINALLY - Setting isApiLoading to false ===');
      setIsApiLoading(false);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteConfirm.show) return;

    setIsApiLoading(true);
    try {
      if (deleteConfirm.type === 'section' && deleteConfirm.sectionIndex !== null) {
        const sectionID = sections[deleteConfirm.sectionIndex].sectionID;
        if (sectionID && onDeleteSection) {
          await onDeleteSection(sectionID);
        }
        const newSections = sections.filter((_, i) => i !== deleteConfirm.sectionIndex);
        setSections(newSections);
      } else if (deleteConfirm.type === 'lesson' && deleteConfirm.sectionIndex !== null && deleteConfirm.lessonIndex !== null) {
        const lessonID = sections[deleteConfirm.sectionIndex].lessons[deleteConfirm.lessonIndex].lessonID;
        if (lessonID && onDeleteLesson) {
          await onDeleteLesson(lessonID);
        }
        const newSections = [...sections];
        newSections[deleteConfirm.sectionIndex].lessons = newSections[deleteConfirm.sectionIndex].lessons.filter(
          (_, i) => i !== deleteConfirm.lessonIndex
        );
        setSections(newSections);
      } else if (deleteConfirm.type === 'resource' && deleteConfirm.sectionIndex !== null && deleteConfirm.lessonIndex !== null) {
        const resourceIndex = deleteConfirm.resourceIndex ?? -1;
        if (resourceIndex >= 0) {
          const resourceID = sections[deleteConfirm.sectionIndex].lessons[deleteConfirm.lessonIndex].resources?.[resourceIndex]?.resourceID;
          if (resourceID && onDeleteResource) {
            await onDeleteResource(resourceID);
          }
          const newSections = [...sections];
          newSections[deleteConfirm.sectionIndex].lessons[deleteConfirm.lessonIndex].resources = 
            newSections[deleteConfirm.sectionIndex].lessons[deleteConfirm.lessonIndex].resources?.filter(
              (_, i) => i !== resourceIndex
            );
          setSections(newSections);
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsApiLoading(false);
    }
    setDeleteConfirm({ show: false, type: null, sectionIndex: null, lessonIndex: null });
  };

  return (
    <div className="space-y-6">
      {/* Sections */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No sections yet. Add one to get started!</p>
          </div>
        ) : (
          sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection(sectionIndex)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandState.sections.has(sectionIndex) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {mode === 'edit' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSection(sectionIndex);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({
                            show: true,
                            type: 'section',
                            sectionIndex,
                            lessonIndex: null,
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              {expandState.sections.has(sectionIndex) && (
                <CardContent className="pt-4 space-y-3">
                  {section.description && (
                    <p className="text-sm text-gray-600">{section.description}</p>
                  )}

                  {/* Lessons */}
                  <div className="space-y-2">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="border rounded-lg p-3 hover:bg-gray-50"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleLesson(sectionIndex, lessonIndex)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {expandState.lessons.get(`${sectionIndex}`)?.has(lessonIndex) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-xs text-gray-500">
                                {lesson.duration}min • {lesson.lessonType}
                              </p>
                            </div>
                          </div>

                          {mode === 'edit' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLesson(sectionIndex, lessonIndex);
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm({
                                    show: true,
                                    type: 'lesson',
                                    sectionIndex,
                                    lessonIndex,
                                  });
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {expandState.lessons.get(`${sectionIndex}`)?.has(lessonIndex) && (
                          <div className="mt-3 ml-6 space-y-2 border-t pt-3">
                            {lesson.lessonType === 'Video' && lesson.videoURL && (
                              <p className="text-sm text-gray-600">
                                <strong>Video:</strong> {lesson.videoURL}
                              </p>
                            )}
                            {lesson.lessonType === 'Reading' && lesson.content && (
                              <p className="text-sm text-gray-600">
                                <strong>Content:</strong> {lesson.content.substring(0, 100)}...
                              </p>
                            )}

                            {/* Resources */}
                            {lesson.resources && lesson.resources.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Resources:</p>
                                {lesson.resources.map((resource, resourceIndex) => (
                                  <div
                                    key={resourceIndex}
                                    className="text-xs text-gray-600 flex justify-between items-center"
                                  >
                                    <span>
                                      [{resource.resourceType}] {resource.resourceTitle}
                                    </span>
                                    {mode === 'edit' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          setDeleteConfirm({
                                            show: true,
                                            type: 'resource',
                                            sectionIndex,
                                            lessonIndex,
                                            resourceIndex: resourceIndex,
                                          })
                                        }
                                      >
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {mode === 'create' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddResource(sectionIndex, lessonIndex)}
                                className="gap-1 mt-2"
                              >
                                <Plus className="w-3 h-3" />
                                Add Resource
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Lesson Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddLesson(sectionIndex)}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </Button>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add Section Button */}
      <Button
        onClick={handleAddSection}
        variant="outline"
        className="w-full gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Section
      </Button>

      {/* Buttons */}
      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={() => onSave(sections)}
          disabled={isLoading || sections.length === 0}
          className="ml-auto"
        >
          {mode === 'create' ? 'Create Course' : 'Save Changes'}
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingDialog.type !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDialog({ type: null, sectionIndex: null, lessonIndex: null, data: null });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDialog.type === 'section'
                ? editingDialog.sectionIndex === null
                  ? 'Add Section'
                  : 'Edit Section'
                : editingDialog.type === 'lesson'
                ? editingDialog.lessonIndex === null
                  ? 'Add Lesson'
                  : 'Edit Lesson'
                : 'Add Resource'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editingDialog.type === 'section' && (
              <>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingDialog.data?.title || ''}
                    onChange={(e) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value },
                      }))
                    }
                    placeholder="Section title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingDialog.data?.description || ''}
                    onChange={(e) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, description: e.target.value },
                      }))
                    }
                    placeholder="Optional section description"
                    rows={3}
                  />
                </div>
              </>
            )}

            {editingDialog.type === 'lesson' && (
              <>
                <div>
                  <Label>Lesson Title</Label>
                  <Input
                    value={editingDialog.data?.title || ''}
                    onChange={(e) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, title: e.target.value },
                      }))
                    }
                    placeholder="Lesson title"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={editingDialog.data?.duration || 30}
                    onChange={(e) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, duration: Number(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Lesson Type</Label>
                  <Select
                    value={editingDialog.data?.lessonType || 'Video'}
                    onValueChange={(value) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, lessonType: value as 'Video' | 'Reading' },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingDialog.data?.lessonType === 'Video' && (
                  <div>
                    <Label>Video URL</Label>
                    <Input
                      type="url"
                      value={editingDialog.data?.videoURL || ''}
                      onChange={(e) =>
                        setEditingDialog((prev) => ({
                          ...prev,
                          data: { ...prev.data, videoURL: e.target.value },
                        }))
                      }
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                )}

                {editingDialog.data?.lessonType === 'Reading' && (
                  <div>
                    <Label>Lesson Content</Label>
                    <Textarea
                      value={editingDialog.data?.content || ''}
                      onChange={(e) =>
                        setEditingDialog((prev) => ({
                          ...prev,
                          data: { ...prev.data, content: e.target.value },
                        }))
                      }
                      placeholder="Enter lesson content"
                      rows={4}
                    />
                  </div>
                )}
              </>
            )}

            {editingDialog.type === 'resource' && (
              <>
                <div>
                  <Label>Resource Type</Label>
                  <Select
                    value={editingDialog.data?.resourceType || 'PDF'}
                    onValueChange={(value) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, resourceType: value as ResourceData['resourceType'] },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="ExternalLink">External Link</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Resource Title</Label>
                  <Input
                    value={editingDialog.data?.resourceTitle || ''}
                    onChange={(e) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, resourceTitle: e.target.value },
                      }))
                    }
                    placeholder="Resource title"
                  />
                </div>
                <div>
                  <Label>Resource URL</Label>
                  <Input
                    type="url"
                    value={editingDialog.data?.resourceURL || ''}
                    onChange={(e) =>
                      setEditingDialog((prev) => ({
                        ...prev,
                        data: { ...prev.data, resourceURL: e.target.value },
                      }))
                    }
                    placeholder="https://example.com/resource"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingDialog({ type: null, sectionIndex: null, lessonIndex: null, data: null })}
              disabled={isApiLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDialog} disabled={isApiLoading}>
              {isApiLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm.show} onOpenChange={(open) => {
        if (!open) setDeleteConfirm({ show: false, type: null, sectionIndex: null, lessonIndex: null });
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this{' '}
              {deleteConfirm.type}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApiLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isApiLoading}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              {isApiLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  FileText,
  Link2,
  GripVertical,
  CheckCircle2,
  Loader2,
  Plus,
} from 'lucide-react';
import { CourseDetail, Section, Lesson, Resource } from '../types';

interface EditCourseStructureProps {
  course: CourseDetail;
  onUpdateSection: (sectionIndex: number, section: Section) => void;
  onUpdateLesson: (
    sectionIndex: number,
    lessonIndex: number,
    lesson: Lesson
  ) => void;
  onUpdateResource: (
    sectionIndex: number,
    lessonIndex: number,
    resourceIndex: number,
    resource: Resource
  ) => void;
  onDeleteSection: (sectionIndex: number) => void;
  onDeleteLesson: (sectionIndex: number, lessonIndex: number) => void;
  onDeleteResource: (
    sectionIndex: number,
    lessonIndex: number,
    resourceIndex: number
  ) => void;
  onCreateSection: (section: Section) => Promise<void>;
  onCreateLesson: (sectionIndex: number, lesson: Lesson) => Promise<void>;
  onCreateResource: (sectionIndex: number, lessonIndex: number, resource: Resource) => Promise<void>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

interface SectionFormData {
  title: string;
  description: string;
}

interface LessonFormData {
  title: string;
  duration: number;
  lessonType: 'Video' | 'Reading';
  videoURL: string;
  content: string;
}

interface ResourceFormData {
  resourceType: 'PDF' | 'Video' | 'ExternalLink' | 'Document';
  resourceTitle: string;
  resourceURL: string;
}

export default function EditCourseStructure({
  course,
  onUpdateSection,
  onUpdateLesson,
  onUpdateResource,
  onDeleteSection,
  onDeleteLesson,
  onDeleteResource,
  onCreateSection,
  onCreateLesson,
  onCreateResource,
  onBack,
  onSubmit,
  isSubmitting,
}: EditCourseStructureProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );
  const [expandedLessons, setExpandedLessons] = useState<Map<string, boolean>>(
    new Map()
  );

  // Debug logging
  useEffect(() => {
    console.log('=== EditCourseStructure DEBUG ===');
    console.log('Course:', course);
    console.log('Section data:', course.section);
    console.log('Section length:', course.section?.length);
    
    if (course.section && course.section.length > 0) {
      console.log('First section:', course.section[0]);
      console.log('First section lessons:', course.section[0].lessons);
      
      if (course.section[0].lessons && course.section[0].lessons.length > 0) {
        console.log('First lesson:', course.section[0].lessons[0]);
        console.log('First lesson resources:', course.section[0].lessons[0].resources);
        console.log('Resources length:', course.section[0].lessons[0].resources?.length);
        
        // Log all lessons with their resources
        course.section.forEach((section, sIdx) => {
          console.log(`\n=== Section ${sIdx}: ${section.title} ===`);
          section.lessons?.forEach((lesson, lIdx) => {
            console.log(`  Lesson ${lIdx}: ${lesson.title}`);
            console.log(`    - Resources array exists: ${!!lesson.resources}`);
            console.log(`    - Resources length: ${lesson.resources?.length || 0}`);
            if (lesson.resources && lesson.resources.length > 0) {
              console.log(`    - Resources:`, lesson.resources);
            }
          });
        });
      }
    }
  }, [course]);

  // Edit section dialog
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(
    null
  );
  const [editingSectionData, setEditingSectionData] =
    useState<SectionFormData | null>(null);

  // Edit lesson dialog
  const [editingLessonKey, setEditingLessonKey] = useState<string | null>(null);
  const [editingLessonData, setEditingLessonData] =
    useState<LessonFormData | null>(null);

  // Edit resource dialog
  const [editingResourceKey, setEditingResourceKey] = useState<string | null>(
    null
  );
  const [editingResourceData, setEditingResourceData] =
    useState<ResourceFormData | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'section' | 'lesson' | 'resource';
    sectionIndex: number;
    lessonIndex?: number;
    resourceIndex?: number;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Create section state
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionData, setNewSectionData] = useState<SectionFormData>({
    title: '',
    description: '',
  });

  // Create lesson state
  const [isCreatingLesson, setIsCreatingLesson] = useState<number | null>(null);
  const [newLessonData, setNewLessonData] = useState<LessonFormData>({
    title: '',
    duration: 0,
    lessonType: 'Video',
    videoURL: '',
    content: '',
  });

  // Create resource state (for lesson creation)
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [newResourceData, setNewResourceData] = useState<ResourceFormData>({
    resourceType: 'PDF',
    resourceTitle: '',
    resourceURL: '',
  });
  const [lessonResources, setLessonResources] = useState<ResourceFormData[]>([]);

  // Edit resource state (for lesson editing)
  const [showEditResourceDialog, setShowEditResourceDialog] = useState(false);
  const [editResourceData, setEditResourceData] = useState<ResourceFormData>({
    resourceType: 'PDF',
    resourceTitle: '',
    resourceURL: '',
  });
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [editLessonResources, setEditLessonResources] = useState<Resource[]>([]);

  // Create resource state (for standalone resource creation after lesson created)
  const [isCreatingResource, setIsCreatingResource] = useState<string | null>(null);
  const [standaloneResourceData, setStandaloneResourceData] = useState<ResourceFormData>({
    resourceType: 'PDF',
    resourceTitle: '',
    resourceURL: '',
  });

  // Create section
  const createSection = async () => {
    if (newSectionData && newSectionData.title.trim()) {
      setIsSaving(true);
      try {
        const newSection: Section = {
          sectionID: Math.floor(Math.random() * 10000),
          courseID: course.id,
          title: newSectionData.title,
          description: newSectionData.description,
          orderIndex: course.section.length,
          lessons: [],
        };

        onCreateSection(newSection);
        setIsCreatingSection(false);
        setNewSectionData({ title: '', description: '' });
      } catch (error) {
        console.error('Error creating section:', error);
        alert('Failed to create section');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Create lesson
  // Add resource to lesson during creation
  const addResourceToLesson = () => {
    if (!newResourceData.resourceTitle.trim() || !newResourceData.resourceURL.trim()) {
      alert('Please fill in resource title and URL');
      return;
    }

    setLessonResources([...lessonResources, newResourceData]);
    setNewResourceData({ resourceType: 'PDF', resourceTitle: '', resourceURL: '' });
    setShowNewResourceDialog(false);
  };

  // Remove resource from lesson during creation
  const removeResourceFromLesson = (index: number) => {
    setLessonResources(lessonResources.filter((_, i) => i !== index));
  };

  const createLesson = async () => {
    if (isCreatingLesson !== null && newLessonData && newLessonData.title.trim()) {
      setIsSaving(true);
      try {
        const lessonCount = course.section[isCreatingLesson].lessons?.length || 0;

        const newLesson: Lesson = {
          lessonID: Math.floor(Math.random() * 10000),
          title: newLessonData.title,
          duration: newLessonData.duration,
          lessonType: newLessonData.lessonType,
          videoURL: newLessonData.videoURL,
          content: newLessonData.content,
          orderIndex: lessonCount,
          createdAt: new Date().toISOString(),
          resources: lessonResources.map((res) => ({
            resourceID: Math.floor(Math.random() * 10000),
            resourceType: res.resourceType,
            resourceTitle: res.resourceTitle,
            resourceURL: res.resourceURL,
            uploadedAt: new Date().toISOString(),
          })),
        };

        onCreateLesson(isCreatingLesson, newLesson);
        setIsCreatingLesson(null);
        setNewLessonData({
          title: '',
          duration: 0,
          lessonType: 'Video',
          videoURL: '',
          content: '',
        });
        setLessonResources([]);
        setShowNewResourceDialog(false);
      } catch (error) {
        console.error('Error creating lesson:', error);
        alert('Failed to create lesson');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Create resource (after lesson created)
  const createResource = async () => {
    if (isCreatingResource && standaloneResourceData && standaloneResourceData.resourceTitle.trim()) {
      setIsSaving(true);
      try {
        const [sectionIndex, lessonIndex] = isCreatingResource.split('-').map(Number);

        const newResource: Resource = {
          resourceID: Math.floor(Math.random() * 10000),
          resourceType: standaloneResourceData.resourceType,
          resourceTitle: standaloneResourceData.resourceTitle,
          resourceURL: standaloneResourceData.resourceURL,
          uploadedAt: new Date().toISOString(),
        };

        onCreateResource(sectionIndex, lessonIndex, newResource);
        setIsCreatingResource(null);
        setStandaloneResourceData({
          resourceType: 'PDF',
          resourceTitle: '',
          resourceURL: '',
        });
      } catch (error) {
        console.error('Error creating resource:', error);
        alert('Failed to create resource');
      } finally {
        setIsSaving(false);
      }
    }
  };

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

  // Add resource to edit lesson
  const addResourceToEditLesson = () => {
    if (!editResourceData.resourceTitle.trim() || !editResourceData.resourceURL.trim()) {
      alert('Please fill in resource title and URL');
      return;
    }

    const newResource: Resource = {
      resourceID: Math.floor(Math.random() * 10000),
      resourceType: editResourceData.resourceType,
      resourceTitle: editResourceData.resourceTitle,
      resourceURL: editResourceData.resourceURL,
      uploadedAt: new Date().toISOString(),
    };

    setEditLessonResources([...editLessonResources, newResource]);
    setEditResourceData({ resourceType: 'PDF', resourceTitle: '', resourceURL: '' });
    setShowEditResourceDialog(false);
  };

  // Update resource in edit lesson
  const updateEditLessonResource = () => {
    if (editingResourceIndex === null) return;
    if (!editResourceData.resourceTitle.trim() || !editResourceData.resourceURL.trim()) {
      alert('Please fill in resource title and URL');
      return;
    }

    const updated = [...editLessonResources];
    updated[editingResourceIndex] = {
      ...updated[editingResourceIndex],
      resourceType: editResourceData.resourceType,
      resourceTitle: editResourceData.resourceTitle,
      resourceURL: editResourceData.resourceURL,
    };

    setEditLessonResources(updated);
    setEditResourceData({ resourceType: 'PDF', resourceTitle: '', resourceURL: '' });
    setEditingResourceIndex(null);
    setShowEditResourceDialog(false);
  };

  // Remove resource from edit lesson
  const removeResourceFromEditLesson = (index: number) => {
    setEditLessonResources(editLessonResources.filter((_, i) => i !== index));
  };

  // Start editing resource in edit lesson
  const startEditingEditLessonResource = (index: number) => {
    setEditResourceData({
      resourceType: editLessonResources[index].resourceType,
      resourceTitle: editLessonResources[index].resourceTitle,
      resourceURL: editLessonResources[index].resourceURL,
    });
    setEditingResourceIndex(index);
    setShowEditResourceDialog(true);
  };

  // Open edit section dialog
  const openEditSection = (sectionIndex: number) => {
    const section = course.section[sectionIndex];
    setEditingSectionIndex(sectionIndex);
    setEditingSectionData({
      title: section.title,
      description: section.description,
    });
  };

  // Save section
  const saveSection = async () => {
    if (
      editingSectionIndex !== null &&
      editingSectionData &&
      editingSectionData.title.trim()
    ) {
      setIsSaving(true);
      try {
        const section = course.section[editingSectionIndex];
        const updatedSection: Section = {
          ...section,
          title: editingSectionData.title,
          description: editingSectionData.description,
        };
        onUpdateSection(editingSectionIndex, updatedSection);
        setEditingSectionIndex(null);
        setEditingSectionData(null);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Open edit lesson dialog
  const openEditLesson = (sectionIndex: number, lessonIndex: number) => {
    const lesson = course.section[sectionIndex].lessons[lessonIndex];
    setEditingLessonKey(`${sectionIndex}-${lessonIndex}`);
    setEditingLessonData({
      title: lesson.title,
      duration: lesson.duration,
      lessonType: lesson.lessonType as 'Video' | 'Reading',
      videoURL: lesson.videoURL || '',
      content: lesson.content || '',
    });
    setEditLessonResources(lesson.resources || []);
  };

  // Save lesson
  const saveLesson = async () => {
    if (editingLessonKey && editingLessonData && editingLessonData.title.trim()) {
      setIsSaving(true);
      try {
        const [sectionIndex, lessonIndex] = editingLessonKey
          .split('-')
          .map(Number);
        const lesson = course.section[sectionIndex].lessons[lessonIndex];
        const updatedLesson: Lesson = {
          ...lesson,
          title: editingLessonData.title,
          duration: editingLessonData.duration,
          lessonType: editingLessonData.lessonType,
          videoURL: editingLessonData.videoURL,
          content: editingLessonData.content,
          resources: editLessonResources,
        };
        onUpdateLesson(sectionIndex, lessonIndex, updatedLesson);
        setEditingLessonKey(null);
        setEditingLessonData(null);
        setEditLessonResources([]);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Open edit resource dialog
  const openEditResource = (
    sectionIndex: number,
    lessonIndex: number,
    resourceIndex: number
  ) => {
    const resource = course.section[sectionIndex].lessons[lessonIndex].resources[resourceIndex];
    setEditingResourceKey(`${sectionIndex}-${lessonIndex}-${resourceIndex}`);
    setEditingResourceData({
      resourceType: resource.resourceType,
      resourceTitle: resource.resourceTitle,
      resourceURL: resource.resourceURL,
    });
  };

  // Save resource
  const saveResource = async () => {
    if (
      editingResourceKey &&
      editingResourceData &&
      editingResourceData.resourceTitle.trim()
    ) {
      setIsSaving(true);
      try {
        const [sectionIndex, lessonIndex, resourceIndex] = editingResourceKey
          .split('-')
          .map(Number);
        const resource =
          course.section[sectionIndex].lessons[lessonIndex].resources[resourceIndex];
        const updatedResource: Resource = {
          ...resource,
          resourceType: editingResourceData.resourceType,
          resourceTitle: editingResourceData.resourceTitle,
          resourceURL: editingResourceData.resourceURL,
        };
        onUpdateResource(
          sectionIndex,
          lessonIndex,
          resourceIndex,
          updatedResource
        );
        setEditingResourceKey(null);
        setEditingResourceData(null);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'section') {
      onDeleteSection(deleteConfirm.sectionIndex);
    } else if (deleteConfirm.type === 'lesson') {
      onDeleteLesson(deleteConfirm.sectionIndex, deleteConfirm.lessonIndex!);
    } else if (deleteConfirm.type === 'resource') {
      onDeleteResource(
        deleteConfirm.sectionIndex,
        deleteConfirm.lessonIndex!,
        deleteConfirm.resourceIndex!
      );
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Course Content
            </h2>
            <p className="text-gray-600 mt-1">
              Manage sections, lessons, and resources for your course
            </p>
          </div>
          <Button
            onClick={() => setIsCreatingSection(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {course.section && course.section.length > 0 ? (
            course.section.map((section, sectionIndex) => (
              <Card key={section.sectionID} className="overflow-hidden">
                {/* Section Header */}
                <div
                  className="flex items-center gap-4 p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => toggleSection(sectionIndex)}
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  {expandedSections.has(sectionIndex) ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {section.lessons?.length || 0} lessons
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditSection(sectionIndex);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({
                          type: 'section',
                          sectionIndex,
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(sectionIndex) && (
                  <CardContent className="p-0">
                    {/* Lessons List */}
                    <div className="divide-y">
                      {section.lessons && section.lessons.length > 0 ? (
                        section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.lessonID}
                            className="p-4 hover:bg-gray-50 transition"
                          >
                            {/* Lesson Header */}
                            <div
                              className="flex items-center gap-3 cursor-pointer"
                              onClick={() =>
                                toggleLesson(sectionIndex, lessonIndex)
                              }
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              {expandedLessons.get(
                                `${sectionIndex}-${lessonIndex}`
                              ) ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                              <FileText className="w-4 h-4 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {lesson.duration} minutes •{' '}
                                  {lesson.lessonType}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditLesson(sectionIndex, lessonIndex);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({
                                      type: 'lesson',
                                      sectionIndex,
                                      lessonIndex,
                                    });
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Lesson Details */}
                            {expandedLessons.get(
                              `${sectionIndex}-${lessonIndex}`
                            ) && (
                              <div className="mt-4 space-y-3 pl-7 border-l-2 border-gray-200">
                                {/* Lesson Content */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 uppercase">
                                    Lesson Content
                                  </p>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {lesson.content || 'No content'}
                                  </p>
                                </div>

                                {lesson.videoURL && (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase">
                                      Video
                                    </p>
                                    <a
                                      href={lesson.videoURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-2"
                                    >
                                      <Link2 className="w-3 h-3" />
                                      Watch Video
                                    </a>
                                  </div>
                                )}

                                {/* Resources */}
                                {lesson.resources &&
                                  lesson.resources.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                                        Resources ({lesson.resources.length})
                                      </p>
                                      <div className="space-y-2">
                                        {lesson.resources.map(
                                          (resource, resourceIndex) => (
                                            <div
                                              key={resource.resourceID}
                                              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                                            >
                                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                  <p className="text-sm font-medium text-gray-900 truncate">
                                                    {resource.resourceTitle}
                                                  </p>
                                                  <p className="text-xs text-gray-500">
                                                    {resource.resourceType}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex gap-2 flex-shrink-0">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() =>
                                                    openEditResource(
                                                      sectionIndex,
                                                      lessonIndex,
                                                      resourceIndex
                                                    )
                                                  }
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() =>
                                                    setDeleteConfirm({
                                                      type: 'resource',
                                                      sectionIndex,
                                                      lessonIndex,
                                                      resourceIndex,
                                                    })
                                                  }
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setIsCreatingResource(
                                            `${sectionIndex}-${lessonIndex}`
                                          )
                                        }
                                        className="w-full mt-2 gap-2"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add Resource
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          This Section has no lessons yet
                        </div>
                      )}
                    </div>

                    {/* Add Lesson Button */}
                    <div className="p-4 border-t bg-gray-50">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreatingLesson(sectionIndex)}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Lesson
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-gray-500">
              <p>Course has no Sections yet</p>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Section Dialog */}
      <Dialog
        open={editingSectionIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSectionIndex(null);
            setEditingSectionData(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>

          {editingSectionData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-title" className="text-base">
                  Section Title
                </Label>
                <Input
                  id="section-title"
                  value={editingSectionData.title}
                  onChange={(e) =>
                    setEditingSectionData({
                      ...editingSectionData,
                      title: e.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>
              <div>
                <Label htmlFor="section-description" className="text-base">
                  Section Description
                </Label>
                <Textarea
                  id="section-description"
                  value={editingSectionData.description}
                  onChange={(e) =>
                    setEditingSectionData({
                      ...editingSectionData,
                      description: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSectionIndex(null);
                setEditingSectionData(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveSection} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog
        open={editingLessonKey !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLessonKey(null);
            setEditingLessonData(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>

          {editingLessonData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="lesson-title" className="text-base">
                  Lesson Title
                </Label>
                <Input
                  id="lesson-title"
                  value={editingLessonData.title}
                  onChange={(e) =>
                    setEditingLessonData({
                      ...editingLessonData,
                      title: e.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lesson-duration" className="text-sm">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    min="1"
                    value={editingLessonData.duration}
                    onChange={(e) =>
                      setEditingLessonData({
                        ...editingLessonData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <Label htmlFor="lesson-type" className="text-sm">
                    Lesson Type
                  </Label>
                  <Select
                    value={editingLessonData.lessonType}
                    onValueChange={(value) =>
                      setEditingLessonData({
                        ...editingLessonData,
                        lessonType: value as 'Video' | 'Reading',
                      })
                    }
                  >
                    <SelectTrigger disabled={isSaving}>
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
                  <Label htmlFor="lesson-video" className="text-base">
                    URL Video
                  </Label>
                  <Input
                    id="lesson-video"
                    value={editingLessonData.videoURL}
                    onChange={(e) =>
                      setEditingLessonData({
                        ...editingLessonData,
                        videoURL: e.target.value,
                      })
                    }
                    disabled={isSaving}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              )}

              {editingLessonData.lessonType === 'Reading' && (
                <div>
                  <Label htmlFor="lesson-content" className="text-base">
                    Lesson Content
                  </Label>
                  <Textarea
                    id="lesson-content"
                    value={editingLessonData.content}
                    onChange={(e) =>
                      setEditingLessonData({
                        ...editingLessonData,
                        content: e.target.value,
                      })
                    }
                    disabled={isSaving}
                    rows={4}
                  />
                </div>
              )}

              {/* Resources Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">
                    Resources ({editLessonResources.length})
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditResourceData({ resourceType: 'PDF', resourceTitle: '', resourceURL: '' });
                      setEditingResourceIndex(null);
                      setShowEditResourceDialog(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Resource
                  </Button>
                </div>

                {editLessonResources.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {editLessonResources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {resource.resourceTitle}
                          </p>
                          <p className="text-xs text-gray-500">{resource.resourceType}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => startEditingEditLessonResource(index)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => removeResourceFromEditLesson(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingLessonKey(null);
                setEditingLessonData(null);
                setEditLessonResources([]);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={saveLesson} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Resource Dialog for Edit Lesson */}
      <Dialog open={showEditResourceDialog} onOpenChange={setShowEditResourceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-lesson-resource-type">Resource Type</Label>
              <Select
                value={editResourceData.resourceType}
                onValueChange={(value) =>
                  setEditResourceData({
                    ...editResourceData,
                    resourceType: value as 'PDF' | 'ExternalLink',
                  })
                }
              >
                <SelectTrigger disabled={isSaving}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="ExternalLink">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-lesson-resource-title">Resource Name</Label>
              <Input
                id="edit-lesson-resource-title"
                value={editResourceData.resourceTitle}
                onChange={(e) =>
                  setEditResourceData({
                    ...editResourceData,
                    resourceTitle: e.target.value,
                  })
                }
                disabled={isSaving}
                placeholder="e.g., Grammar Guide"
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-resource-url">Resource URL</Label>
              <Input
                id="edit-lesson-resource-url"
                value={editResourceData.resourceURL}
                onChange={(e) =>
                  setEditResourceData({
                    ...editResourceData,
                    resourceURL: e.target.value,
                  })
                }
                disabled={isSaving}
                placeholder="https://example.com/resource"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditResourceDialog(false);
                setEditingResourceIndex(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingResourceIndex !== null
                  ? updateEditLessonResource
                  : addResourceToEditLesson
              }
              disabled={
                !editResourceData.resourceTitle.trim() ||
                !editResourceData.resourceURL.trim()
              }
            >
              {editingResourceIndex !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={editingResourceKey !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingResourceKey(null);
            setEditingResourceData(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>

          {editingResourceData && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="resource-type" className="text-base">
                  Resource Type
                </Label>
                <Select
                  value={editingResourceData.resourceType}
                  onValueChange={(value) =>
                    setEditingResourceData({
                      ...editingResourceData,
                      resourceType: value as
                        | 'PDF'
                        | 'Video'
                        | 'ExternalLink'
                        | 'Document',
                    })
                  }
                >
                  <SelectTrigger disabled={isSaving}>
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
                <Label htmlFor="resource-title" className="text-base">
                  Resource Name
                </Label>
                <Input
                  id="resource-title"
                  value={editingResourceData.resourceTitle}
                  onChange={(e) =>
                    setEditingResourceData({
                      ...editingResourceData,
                      resourceTitle: e.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>

              <div>
                <Label htmlFor="resource-url" className="text-base">
                  Resource URL
                </Label>
                <Input
                  id="resource-url"
                  value={editingResourceData.resourceURL}
                  onChange={(e) =>
                    setEditingResourceData({
                      ...editingResourceData,
                      resourceURL: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  placeholder="https://example.com/resource"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingResourceKey(null);
                setEditingResourceData(null);
              }}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button onClick={saveResource} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteConfirm?.type === 'section' &&
              'Are you sure you want to delete this Section? All lessons in the Section will be deleted.'}
            {deleteConfirm?.type === 'lesson' &&
              'Are you sure you want to delete this lesson? All resources will be deleted.'}
            {deleteConfirm?.type === 'resource' &&
              'Are you sure you want to delete this resource?'}
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Section Dialog */}
      <Dialog
        open={isCreatingSection}
        onOpenChange={setIsCreatingSection}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-section-title" className="text-base">
                Section Title
              </Label>
              <Input
                id="new-section-title"
                value={newSectionData.title}
                onChange={(e) =>
                  setNewSectionData({
                    ...newSectionData,
                    title: e.target.value,
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="new-section-description" className="text-base">
                Section Description
              </Label>
              <Textarea
                id="new-section-description"
                value={newSectionData.description}
                onChange={(e) =>
                  setNewSectionData({
                    ...newSectionData,
                    description: e.target.value,
                  })
                }
                disabled={isSaving}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatingSection(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={createSection} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog
        open={isCreatingLesson !== null}
        onOpenChange={(open) => {
          if (!open) setIsCreatingLesson(null);
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-lesson-title" className="text-base">
                Lesson Title
              </Label>
              <Input
                id="new-lesson-title"
                value={newLessonData.title}
                onChange={(e) =>
                  setNewLessonData({
                    ...newLessonData,
                    title: e.target.value,
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-lesson-duration" className="text-sm">
                  Duration (minutes)
                </Label>
                <Input
                  id="new-lesson-duration"
                  type="number"
                  min="1"
                  value={newLessonData.duration}
                  onChange={(e) =>
                    setNewLessonData({
                      ...newLessonData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={isSaving}
                />
              </div>
              <div>
                <Label htmlFor="new-lesson-type" className="text-sm">
                  Lesson Type
                </Label>
                <Select
                  value={newLessonData.lessonType}
                  onValueChange={(value) =>
                    setNewLessonData({
                      ...newLessonData,
                      lessonType: value as 'Video' | 'Reading',
                    })
                  }
                >
                  <SelectTrigger disabled={isSaving}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newLessonData.lessonType === 'Video' && (
              <div>
                <Label htmlFor="new-lesson-video" className="text-base">
                  Video URL
                </Label>
                <Input
                  id="new-lesson-video"
                  value={newLessonData.videoURL}
                  onChange={(e) =>
                    setNewLessonData({
                      ...newLessonData,
                      videoURL: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}
            {newLessonData.lessonType === 'Reading' && (
              <div>
                <Label htmlFor="new-lesson-content" className="text-base">
                  Lesson Content
                </Label>
                <Textarea
                  id="new-lesson-content"
                  value={newLessonData.content}
                  onChange={(e) =>
                    setNewLessonData({
                      ...newLessonData,
                      content: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  rows={4}
                />
              </div>
            )}

            {/* Resources Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base">
                  Resources ({lessonResources.length})
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewResourceDialog(true)}
                  className="gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add Resource
                </Button>
              </div>

              {lessonResources.length > 0 && (
                <div className="space-y-2 mb-3">
                  {lessonResources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {resource.resourceTitle}
                        </p>
                        <p className="text-xs text-gray-500">{resource.resourceType}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeResourceFromLesson(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
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
                setIsCreatingLesson(null);
                setLessonResources([]);
                setShowNewResourceDialog(false);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={createLesson} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Resource to Lesson Dialog (during lesson creation) */}
      <Dialog open={showNewResourceDialog} onOpenChange={setShowNewResourceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-resource-type">Resource Type</Label>
              <Select
                value={newResourceData.resourceType}
                onValueChange={(value) =>
                  setNewResourceData({
                    ...newResourceData,
                    resourceType: value as 'PDF' | 'ExternalLink',
                  })
                }
              >
                <SelectTrigger disabled={isSaving}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="ExternalLink">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson-resource-title">Resource Name</Label>
              <Input
                id="lesson-resource-title"
                value={newResourceData.resourceTitle}
                onChange={(e) =>
                  setNewResourceData({
                    ...newResourceData,
                    resourceTitle: e.target.value,
                  })
                }
                disabled={isSaving}
                placeholder="e.g., Grammar Guide"
              />
            </div>
            <div>
              <Label htmlFor="lesson-resource-url">Resource URL</Label>
              <Input
                id="lesson-resource-url"
                value={newResourceData.resourceURL}
                onChange={(e) =>
                  setNewResourceData({
                    ...newResourceData,
                    resourceURL: e.target.value,
                  })
                }
                disabled={isSaving}
                placeholder="https://example.com/resource"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewResourceDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={addResourceToLesson}
              disabled={
                !newResourceData.resourceTitle.trim() ||
                !newResourceData.resourceURL.trim()
              }
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Resource Dialog (Standalone) */}
      <Dialog
        open={isCreatingResource !== null}
        onOpenChange={(open) => {
          if (!open) setIsCreatingResource(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-resource-type" className="text-base">
                Resource Type
              </Label>
              <Select
                value={standaloneResourceData.resourceType}
                onValueChange={(value) =>
                  setStandaloneResourceData({
                    ...standaloneResourceData,
                    resourceType: value as 'PDF' | 'ExternalLink',
                  })
                }
              >
                <SelectTrigger disabled={isSaving}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="ExternalLink">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-resource-title" className="text-base">
                Resource Name
              </Label>
              <Input
                id="new-resource-title"
                value={standaloneResourceData.resourceTitle}
                onChange={(e) =>
                  setStandaloneResourceData({
                    ...standaloneResourceData,
                    resourceTitle: e.target.value,
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="new-resource-url" className="text-base">
                Resource URL
              </Label>
              <Input
                id="new-resource-url"
                value={standaloneResourceData.resourceURL}
                onChange={(e) =>
                  setStandaloneResourceData({
                    ...standaloneResourceData,
                    resourceURL: e.target.value,
                  })
                }
                disabled={isSaving}
                placeholder="https://example.com/resource"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatingResource(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={createResource} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

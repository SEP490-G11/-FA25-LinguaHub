import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddLessonFormData, EditLessonFormData, LessonResourceData } from '../types';
import { Video, FileText, Plus, Edit2, Trash2, FileText as FileIcon, Link2 } from 'lucide-react';

const lessonSchema = z
  .object({
    Title: z.string().min(1, 'Lesson title is required').max(100, 'Title is too long'),
    Duration: z.number().min(1, 'Duration must be at least 1 minute').max(300, 'Duration cannot exceed 300 minutes'),
    LessonType: z.enum(['Video', 'Reading']),
    VideoURL: z.string().url('Invalid URL').optional().or(z.literal('')),
    Content: z.string().max(10000, 'Content is too long').optional(),
  })
  .refine(
    (data) => {
      if (data.LessonType === 'Video') {
        return !!data.VideoURL && data.VideoURL.length > 0;
      }
      return true;
    },
    {
      message: 'Video URL is required for video lessons',
      path: ['VideoURL'],
    }
  )
  .refine(
    (data) => {
      if (data.LessonType === 'Reading') {
        return !!data.Content && data.Content.length > 0;
      }
      return true;
    },
    {
      message: 'Content is required for reading lessons',
      path: ['Content'],
    }
  );

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddLessonFormData | EditLessonFormData, resources: LessonResourceData[]) => void;
  editData?: EditLessonFormData & { Resources?: LessonResourceData[] };
  isSubmitting?: boolean;
}

export function AddLessonModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isSubmitting = false,
}: AddLessonModalProps) {
  const [resources, setResources] = useState<LessonResourceData[]>(
    editData?.Resources || []
  );
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [editingResourceIndex, setEditingResourceIndex] = useState<number | null>(null);
  const [resourceForm, setResourceForm] = useState<{
    ResourceType: 'PDF' | 'ExternalLink';
    ResourceTitle: string;
    ResourceURL: string;
  }>({
    ResourceType: 'PDF',
    ResourceTitle: '',
    ResourceURL: '',
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<AddLessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: editData || {
      Title: '',
      Duration: 15,
      LessonType: 'Video',
      VideoURL: '',
      Content: '',
    },
  });

  const lessonType = watch('LessonType');

  const onSubmitForm = (data: AddLessonFormData) => {
    if (editData) {
      onSubmit({ ...data, LessonID: editData.LessonID }, resources);
    } else {
      onSubmit(data, resources);
    }
    reset();
    setResources([]);
  };

  const handleClose = () => {
    reset();
    setResources(editData?.Resources || []);
    setShowResourceDialog(false);
    setEditingResourceIndex(null);
    onClose();
  };

  const handleAddResource = () => {
    setResourceForm({
      ResourceType: 'PDF',
      ResourceTitle: '',
      ResourceURL: '',
    });
    setEditingResourceIndex(null);
    setShowResourceDialog(true);
  };

  const handleEditResource = (index: number) => {
    const resource = resources[index];
    setResourceForm({
      ResourceType: resource.ResourceType,
      ResourceTitle: resource.ResourceTitle,
      ResourceURL: resource.ResourceURL,
    });
    setEditingResourceIndex(index);
    setShowResourceDialog(true);
  };

  const handleSaveResource = () => {
    if (!resourceForm.ResourceTitle.trim() || !resourceForm.ResourceURL.trim()) {
      alert('Please fill in all resource fields');
      return;
    }

    if (editingResourceIndex !== null) {
      // Edit existing resource
      setResources((prev) =>
        prev.map((res, idx) =>
          idx === editingResourceIndex ? resourceForm : res
        )
      );
    } else {
      // Add new resource
      setResources((prev) => [...prev, resourceForm]);
    }

    setShowResourceDialog(false);
    setResourceForm({
      ResourceType: 'PDF',
      ResourceTitle: '',
      ResourceURL: '',
    });
    setEditingResourceIndex(null);
  };

  const handleDeleteResource = (index: number) => {
    if (confirm('Delete this resource?')) {
      setResources((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const getResourceIcon = (type: 'PDF' | 'ExternalLink') => {
    return type === 'PDF' ? <FileIcon className="w-4 h-4" /> : <Link2 className="w-4 h-4" />;
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
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Lesson Title *</Label>
                <Input
                  id="title"
                  {...register('Title')}
                  placeholder="e.g., Present Tense Conjugation"
                  className="mt-1.5"
                />
                {errors.Title && (
                  <p className="text-sm text-red-600 mt-1">{errors.Title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('Duration', { valueAsNumber: true })}
                  placeholder="15"
                  className="mt-1.5"
                />
                {errors.Duration && (
                  <p className="text-sm text-red-600 mt-1">{errors.Duration.message}</p>
                )}
              </div>

              <div>
                <Label>Lesson Type *</Label>
                <Controller
                  name="LessonType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      <div>
                        <RadioGroupItem
                          value="Video"
                          id="video"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="video"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 cursor-pointer"
                        >
                          <Video className="h-8 w-8 mb-2 text-indigo-600" />
                          <span className="font-medium">Video Lesson</span>
                          <span className="text-xs text-gray-500 mt-1">
                            Upload or link video
                          </span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="Reading"
                          id="reading"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="reading"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50 peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50 cursor-pointer"
                        >
                          <FileText className="h-8 w-8 mb-2 text-green-600" />
                          <span className="font-medium">Reading Lesson</span>
                          <span className="text-xs text-gray-500 mt-1">
                            Text-based content
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
                {errors.LessonType && (
                  <p className="text-sm text-red-600 mt-1">{errors.LessonType.message}</p>
                )}
              </div>

              {lessonType === 'Video' && (
                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    {...register('VideoURL')}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-1.5"
                  />
                  {errors.VideoURL && (
                    <p className="text-sm text-red-600 mt-1">{errors.VideoURL.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    Supports YouTube, Vimeo, and direct video links
                  </p>
                  {watch('VideoURL') && (
                    <div className="mt-3">
                      <Label>Video Preview</Label>
                      <div className="mt-1.5 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(watch('VideoURL') || '')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {lessonType === 'Reading' && (
                <div>
                  <Label htmlFor="content">Lesson Content *</Label>
                  <Textarea
                    id="content"
                    {...register('Content')}
                    placeholder="Enter the lesson content here..."
                    rows={8}
                    className="mt-1.5 font-mono text-sm"
                  />
                  {errors.Content && (
                    <p className="text-sm text-red-600 mt-1">{errors.Content.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">
                    Supports markdown formatting
                  </p>
                </div>
              )}

              {/* Resources Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Resources</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddResource}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Resource
                  </Button>
                </div>

                {resources.length > 0 && (
                  <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                    {resources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-white border rounded"
                      >
                        {getResourceIcon(resource.ResourceType)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {resource.ResourceTitle}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {resource.ResourceURL}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditResource(index)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteResource(index)}
                            className="p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editData ? 'Update Lesson' : 'Add Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resource Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={setShowResourceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResourceIndex !== null ? 'Edit Resource' : 'Add Resource'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resource Type</Label>
              <Select
                value={resourceForm.ResourceType}
                onValueChange={(value) =>
                  setResourceForm({
                    ...resourceForm,
                    ResourceType: value as 'PDF' | 'ExternalLink',
                  })
                }
              >
                <SelectTrigger className="mt-1.5">
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
                value={resourceForm.ResourceTitle}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    ResourceTitle: e.target.value,
                  })
                }
                placeholder="e.g., Grammar Guide"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="resource-url">
                {resourceForm.ResourceType === 'PDF' ? 'PDF URL' : 'Link URL'}
              </Label>
              <Input
                id="resource-url"
                value={resourceForm.ResourceURL}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    ResourceURL: e.target.value,
                  })
                }
                placeholder={
                  resourceForm.ResourceType === 'PDF'
                    ? 'https://example.com/file.pdf'
                    : 'https://example.com'
                }
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResourceDialog(false);
                setEditingResourceIndex(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveResource}
              disabled={
                !resourceForm.ResourceTitle.trim() ||
                !resourceForm.ResourceURL.trim()
              }
            >
              {editingResourceIndex !== null ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useForm } from 'react-hook-form';
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
import { AddSectionFormData, EditSectionFormData } from '../types';

const sectionSchema = z.object({
  Title: z.string().min(1, 'Section title is required').max(100, 'Title is too long'),
  Description: z.string().max(500, 'Description is too long').optional(),
});

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddSectionFormData | EditSectionFormData) => void;
  editData?: EditSectionFormData;
  isSubmitting?: boolean;
}

export function AddSectionModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isSubmitting = false,
}: AddSectionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddSectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: editData || {
      Title: '',
      Description: '',
    },
  });

  const onSubmitForm = (data: AddSectionFormData) => {
    if (editData) {
      onSubmit({ ...data, SectionID: editData.SectionID });
    } else {
      onSubmit(data);
    }
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Section' : 'Add New Section'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Section Title *</Label>
              <Input
                id="title"
                {...register('Title')}
                placeholder="e.g., Introduction to Spanish Grammar"
                className="mt-1.5"
              />
              {errors.Title && (
                <p className="text-sm text-red-600 mt-1">{errors.Title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('Description')}
                placeholder="Brief description of what this section covers..."
                rows={4}
                className="mt-1.5"
              />
              {errors.Description && (
                <p className="text-sm text-red-600 mt-1">{errors.Description.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editData ? 'Update Section' : 'Add Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

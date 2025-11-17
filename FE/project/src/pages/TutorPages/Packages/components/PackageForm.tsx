import React, { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageFormProps, PackageFormData, PackageFormErrors } from '../types';

const PackageForm: React.FC<PackageFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    max_slot: 1
  });

  const [errors, setErrors] = useState<PackageFormErrors>({});

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        max_slot: initialData.max_slot || 1
      });
    }
  }, [initialData]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: PackageFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Tên package là bắt buộc';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên package phải có ít nhất 3 ký tự';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Tên package không được vượt quá 100 ký tự';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả package là bắt buộc';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Mô tả package phải có ít nhất 10 ký tự';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Mô tả package không được vượt quá 500 ký tự';
    }

    // Max slot validation
    if (!formData.max_slot || formData.max_slot < 1) {
      newErrors.max_slot = 'Số slot tối đa phải lớn hơn 0';
    } else if (formData.max_slot > 100) {
      newErrors.max_slot = 'Số slot tối đa không được vượt quá 100';
    } else if (!Number.isInteger(formData.max_slot)) {
      newErrors.max_slot = 'Số slot tối đa phải là số nguyên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof PackageFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        max_slot: formData.max_slot
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {mode === 'create' ? 'Tạo Package Mới' : 'Chỉnh Sửa Package'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên Package <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập tên package..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Package Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Mô Tả Package <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết về package..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
              rows={4}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description.length}/500 ký tự
            </p>
          </div>

          {/* Max Slot */}
          <div className="space-y-2">
            <Label htmlFor="max_slot" className="text-sm font-medium">
              Số Slot Tối Đa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="max_slot"
              type="number"
              min="1"
              max="100"
              placeholder="Nhập số slot tối đa..."
              value={formData.max_slot}
              onChange={(e) => handleInputChange('max_slot', parseInt(e.target.value) || 0)}
              className={errors.max_slot ? 'border-red-500 focus-visible:ring-red-500' : ''}
              disabled={isLoading}
            />
            {errors.max_slot && (
              <p className="text-sm text-red-500">{errors.max_slot}</p>
            )}
            <p className="text-xs text-gray-500">
              Số lượng học viên tối đa có thể tham gia package này
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Tạo Package' : 'Cập Nhật Package'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PackageForm;
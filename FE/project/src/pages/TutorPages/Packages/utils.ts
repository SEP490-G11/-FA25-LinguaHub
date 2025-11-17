import { Package, PackageFormData, PackageFormErrors } from './types';

/**
 * Utility functions for Package Management
 */

/**
 * Format date string to Vietnamese locale
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get status badge configuration for package
 * @param isActive Package active status
 * @returns Status configuration object
 */
export const getPackageStatusConfig = (isActive: boolean) => {
  return isActive
    ? {
        label: 'Hoạt động',
        className: 'bg-green-100 text-green-800 border-green-200',
      }
    : {
        label: 'Không hoạt động',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      };
};

/**
 * Validate package form data
 * @param data Package form data
 * @returns Validation errors object
 */
export const validatePackageForm = (data: PackageFormData): PackageFormErrors => {
  const errors: PackageFormErrors = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Tên package là bắt buộc.';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Tên package phải có ít nhất 3 ký tự.';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Tên package không được vượt quá 100 ký tự.';
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Mô tả package là bắt buộc.';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Mô tả package phải có ít nhất 10 ký tự.';
  } else if (data.description.trim().length > 500) {
    errors.description = 'Mô tả package không được vượt quá 500 ký tự.';
  }

  // Max slot validation
  if (!data.max_slot || data.max_slot <= 0) {
    errors.max_slot = 'Số slot tối đa phải lớn hơn 0.';
  } else if (data.max_slot > 100) {
    errors.max_slot = 'Số slot tối đa không được vượt quá 100.';
  } else if (!Number.isInteger(data.max_slot)) {
    errors.max_slot = 'Số slot tối đa phải là số nguyên.';
  }

  return errors;
};

/**
 * Check if form has validation errors
 * @param errors Validation errors object
 * @returns True if there are errors
 */
export const hasFormErrors = (errors: PackageFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Filter packages based on search criteria
 * @param packages Array of packages
 * @param searchTerm Search term
 * @param statusFilter Status filter ('active', 'inactive', 'all')
 * @returns Filtered packages array
 */
export const filterPackages = (
  packages: Package[],
  searchTerm: string = '',
  statusFilter: 'active' | 'inactive' | 'all' = 'all'
): Package[] => {
  let filtered = packages;

  // Apply search filter
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(term) ||
        pkg.description.toLowerCase().includes(term)
    );
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    const isActive = statusFilter === 'active';
    filtered = filtered.filter((pkg) => pkg.is_active === isActive);
  }

  return filtered;
};

/**
 * Sort packages by specified criteria
 * @param packages Array of packages
 * @param sortBy Sort criteria ('name', 'created_at', 'updated_at')
 * @param sortOrder Sort order ('asc', 'desc')
 * @returns Sorted packages array
 */
export const sortPackages = (
  packages: Package[],
  sortBy: 'name' | 'created_at' | 'updated_at' = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Package[] => {
  return [...packages].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'vi-VN');
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};
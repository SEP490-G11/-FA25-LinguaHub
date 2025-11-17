/**
 * TypeScript type definitions for Package Management
 * Based on the design document and API specifications
 */

// Main Package interface matching the API response structure
export interface Package {
  packageid: number;
  name: string;
  description: string;
  tutor_id: number;
  max_slot: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form data interface for creating and updating packages
export interface PackageFormData {
  name: string;
  description: string;
  max_slot: number;
}

// API response interfaces
export interface PackageListResponse {
  packages: Package[];
}

export interface PackageResponse {
  success: boolean;
  message: string;
}

// Component prop interfaces
export interface PackageCardProps {
  package: Package;
  onEdit: (packageId: number) => void;
  onDelete: (packageId: number) => void;
}

export interface PackageFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Package>;
  onSubmit: (data: PackageFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  package: Package | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Filter and search interfaces
export interface PackageFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
}

export interface PackageFiltersProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
}

// Utility types for form validation
export interface PackageFormErrors {
  name?: string;
  description?: string;
  max_slot?: string;
}

// Package statistics interface (for future use)
export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  inactivePackages: number;
}
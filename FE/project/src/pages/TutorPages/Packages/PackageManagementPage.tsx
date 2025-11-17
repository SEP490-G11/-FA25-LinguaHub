import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { tutorPackageApi } from './api';
import { Package as PackageType, PackageFormData } from './types';
import PackageCard from './components/PackageCard';
import PackageForm from './components/PackageForm';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

const PackageManagementPage: React.FC = () => {
  // State management
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  
  // Delete states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<PackageType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetch packages from API
   */
  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await tutorPackageApi.getMyPackages();
      setPackages(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách package');
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    fetchPackages();
  };

  /**
   * Handle create package
   */
  const handleCreatePackage = () => {
    setFormMode('create');
    setEditingPackage(null);
    setShowForm(true);
  };

  /**
   * Handle edit package
   */
  const handleEditPackage = async (packageId: number) => {
    try {
      setIsFormLoading(true);
      const packageData = await tutorPackageApi.getPackageById(packageId);
      setFormMode('edit');
      setEditingPackage(packageData);
      setShowForm(true);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải thông tin package');
    } finally {
      setIsFormLoading(false);
    }
  };

  /**
   * Handle delete package
   */
  const handleDeletePackage = (packageId: number) => {
    const packageToDelete = packages.find(pkg => pkg.packageid === packageId);
    if (packageToDelete) {
      setDeletingPackage(packageToDelete);
      setShowDeleteDialog(true);
    }
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: PackageFormData) => {
    try {
      setIsFormLoading(true);

      if (formMode === 'create') {
        await tutorPackageApi.createPackage(data);
        toast.success('Package đã được tạo thành công!');
      } else if (editingPackage) {
        await tutorPackageApi.updatePackage(editingPackage.packageid, data);
        toast.success('Package đã được cập nhật thành công!');
      }

      setShowForm(false);
      setEditingPackage(null);
      await fetchPackages(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu package');
    } finally {
      setIsFormLoading(false);
    }
  };

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPackage(null);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;

    try {
      setIsDeleting(true);
      await tutorPackageApi.deletePackage(deletingPackage.packageid);
      toast.success('Package đã được xóa thành công!');
      setShowDeleteDialog(false);
      setDeletingPackage(null);
      await fetchPackages(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa package');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle delete cancel
   */
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingPackage(null);
  };

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, []);

  // Show form overlay
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <PackageForm
            mode={formMode}
            initialData={editingPackage || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isFormLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Quản lý Package
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi tất cả các package dịch vụ của bạn
              </p>
            </div>
            <Button 
              onClick={handleCreatePackage}
              size="lg" 
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Thêm Package
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-auto"
                >
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải package...</p>
            </div>
          </div>
        )}

        {/* Package Grid */}
        {!isLoading && packages.length === 0 ? (
          <Card className="p-12 shadow-lg">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Chưa có package nào
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa tạo package dịch vụ nào. Hãy tạo package đầu tiên để bắt đầu!
              </p>
              <Button onClick={handleCreatePackage} className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo package đầu tiên
              </Button>
            </div>
          </Card>
        ) : !isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.packageid}
                package={pkg}
                onEdit={handleEditPackage}
                onDelete={handleDeletePackage}
              />
            ))}
          </div>
        ) : null}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          package={deletingPackage}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
};

export default PackageManagementPage;
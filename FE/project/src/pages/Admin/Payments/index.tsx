import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, CreditCard, Filter } from 'lucide-react';
import { paymentApi } from './api';
import { Payment, PaymentFilters } from './types';
import { calculateStats } from './utils';
import { Filters, PaymentTable, PaymentStats, Pagination } from './components';

export default function PaymentManagementPage() {
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  /**
   * Fetch payments from API with pagination and filters
   */
  const fetchPayments = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      // Build filter object
      const filters: PaymentFilters = {};
      
      if (searchQuery.trim()) {
        filters.search = searchQuery;
      }
      if (selectedType && selectedType !== 'all') {
        filters.type = selectedType as any;
      }
      if (selectedStatus && selectedStatus !== 'all') {
        filters.status = selectedStatus as any;
      }
      if (selectedMethod && selectedMethod !== 'all') {
        filters.method = selectedMethod as any;
      }

      const response = await paymentApi.getPayments(page, limit, filters);
      
      setPayments(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách giao dịch');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    fetchPayments(currentPage);
  };

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedMethod('all');
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedType !== 'all' || 
    selectedStatus !== 'all' || 
    selectedMethod !== 'all';

  // Fetch payments on mount and when filters change
  useEffect(() => {
    fetchPayments(1);
  }, [searchQuery, selectedType, selectedStatus, selectedMethod]);

  // Calculate statistics from current payments
  const stats = calculateStats(payments);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== STICKY HEADER ========== */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        {/* Gradient Top Bar with Stats */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
          <div className="max-w-[1600px] mx-auto px-6 py-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Quản lý thanh toán</h1>
                  <p className="text-blue-100 text-sm">Theo dõi và quản lý giao dịch thanh toán</p>
                </div>
              </div>
            </div>
            
            {/* Payment Statistics */}
            <PaymentStats stats={stats} isLoading={isLoading} />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <Filters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedType={selectedType}
                  onTypeChange={setSelectedType}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedMethod={selectedMethod}
                  onMethodChange={setSelectedMethod}
                />
              </div>
              <Button
                onClick={handleResetFilters}
                variant="outline"
                size="sm"
                disabled={!hasActiveFilters}
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button
                onClick={handleRetry}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
              >
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Đang tải giao dịch...</p>
            </div>
          </div>
        ) : payments.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có giao dịch
            </h3>
            <p className="text-gray-500 text-sm">
              {hasActiveFilters
                ? 'Không tìm thấy giao dịch phù hợp với bộ lọc'
                : 'Chưa có giao dịch thanh toán nào'}
            </p>
          </div>
        ) : (
          /* Payment Table */
          <>
            <PaymentTable payments={payments} />
            
            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={limit}
                isLoading={isLoading}
                onPageChange={fetchPayments}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

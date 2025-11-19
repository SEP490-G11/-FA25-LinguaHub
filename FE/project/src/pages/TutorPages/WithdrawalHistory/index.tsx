import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  History,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { withdrawalHistoryApi } from './api';
import { WithdrawalHistoryItem, WithdrawalStatus } from './types';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: WithdrawalStatus) => {
  const variants: Record<WithdrawalStatus, { color: string; label: string; icon: any }> = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'Chờ duyệt',
      icon: Clock
    },
    APPROVED: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Đã duyệt',
      icon: CheckCircle
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-800 border-green-300',
      label: 'Hoàn thành',
      icon: CheckCircle
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800 border-red-300',
      label: 'Từ chối',
      icon: XCircle
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <Badge className={`${variant.color} border flex items-center gap-1 w-fit`}>
      <Icon className="w-3 h-3" />
      {variant.label}
    </Badge>
  );
};

export default function WithdrawalHistoryPage() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<WithdrawalHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await withdrawalHistoryApi.getMyWithdrawals();
      setWithdrawals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === 'PENDING').length,
    approved: withdrawals.filter((w) => w.status === 'APPROVED').length,
    completed: withdrawals.filter((w) => w.status === 'COMPLETED').length,
    rejected: withdrawals.filter((w) => w.status === 'REJECTED').length,
    totalWithdrawn: withdrawals
      .filter((w) => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.withdrawAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
          <div className="max-w-[1600px] mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/payments')}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Lịch sử rút tiền</h1>
                  <p className="text-cyan-100 text-sm">Theo dõi các yêu cầu rút tiền của bạn</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="text-xs font-medium text-white/80 mb-1">Tổng yêu cầu</div>
                  <div className="text-xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="text-xs font-medium text-white/80 mb-1">Chờ duyệt</div>
                  <div className="text-xl font-bold text-yellow-300">{stats.pending}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="text-xs font-medium text-white/80 mb-1">Đã duyệt</div>
                  <div className="text-xl font-bold text-blue-300">{stats.approved}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="text-xs font-medium text-white/80 mb-1">Hoàn thành</div>
                  <div className="text-xl font-bold text-green-300">{stats.completed}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="text-xs font-medium text-white/80 mb-1">Từ chối</div>
                  <div className="text-xl font-bold text-red-300">{stats.rejected}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="text-xs font-medium text-white/80 mb-1">Đã rút</div>
                  <div className="text-base font-bold">{formatCurrency(stats.totalWithdrawn)}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchWithdrawals}
                className="ml-4"
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Đang tải lịch sử...</p>
            </div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch sử</h3>
            <p className="text-gray-500 text-sm mb-4">Bạn chưa có yêu cầu rút tiền nào</p>
            <Button onClick={() => navigate('/withdrawal')} className="bg-blue-600 hover:bg-blue-700">
              Tạo yêu cầu rút tiền
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Withdraw ID</TableHead>
                      <TableHead className="text-right">Số tiền yêu cầu</TableHead>
                      <TableHead className="text-right">Hoa hồng</TableHead>
                      <TableHead className="text-right">Số tiền nhận</TableHead>
                      <TableHead>Thông tin ngân hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.withdrawId}>
                        <TableCell className="font-mono text-xs">
                          #{withdrawal.withdrawId}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(withdrawal.withdrawAmount)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          -{formatCurrency(withdrawal.commission)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(withdrawal.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-sm">{withdrawal.bankName}</div>
                            <div className="text-xs text-gray-600 font-mono">
                              {withdrawal.bankAccountNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {withdrawal.bankOwnerName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(withdrawal.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedMethod: string;
  onMethodChange: (value: string) => void;
}

export function Filters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedMethod,
  onMethodChange,
}: FiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="flex gap-3 flex-wrap">
      <div className="flex-1 min-w-[250px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Tìm theo mã đơn, ID người dùng, mô tả..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-48">
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger id="payment-type">
            <SelectValue placeholder="Loại thanh toán" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Course">Khóa học</SelectItem>
            <SelectItem value="Booking">Đặt lịch</SelectItem>
            <SelectItem value="Subscription">Đăng ký</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger id="payment-status">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
            <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
            <SelectItem value="FAILED">Thất bại</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select value={selectedMethod} onValueChange={onMethodChange}>
          <SelectTrigger id="payment-method">
            <SelectValue placeholder="Phương thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PAYOS">PayOS</SelectItem>
            <SelectItem value="MOMO">MoMo</SelectItem>
            <SelectItem value="VNPAY">VNPay</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

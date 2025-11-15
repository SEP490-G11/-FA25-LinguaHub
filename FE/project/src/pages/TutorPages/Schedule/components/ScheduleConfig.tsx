import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleConfigProps {
  defaultStartTime: string;
  defaultEndTime: string;
  slotDuration: number;
  defaultPrice: number;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onSlotDurationChange: (duration: number) => void;
  onDefaultPriceChange: (price: number) => void;
}

export const ScheduleConfig: React.FC<ScheduleConfigProps> = ({
  defaultStartTime,
  defaultEndTime,
  slotDuration,
  defaultPrice,
  onStartTimeChange,
  onEndTimeChange,
  onSlotDurationChange,
  onDefaultPriceChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Giờ làm việc mặc định</Label>
        <div className="flex items-center gap-1.5">
          <Input
            type="time"
            value={defaultStartTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="h-8 flex-1 text-xs"
          />
          <span className="text-xs text-gray-500">đến</span>
          <Input
            type="time"
            value={defaultEndTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="h-8 flex-1 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slotDuration" className="text-xs font-medium">
          Thời gian slot mặc định
        </Label>
        <Select
          value={slotDuration.toString()}
          onValueChange={(value) => onSlotDurationChange(Number(value))}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Chọn thời gian slot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 phút</SelectItem>
            <SelectItem value="45">45 phút</SelectItem>
            <SelectItem value="60">60 phút</SelectItem>
            <SelectItem value="90">90 phút</SelectItem>
            <SelectItem value="120">120 phút</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="defaultPrice" className="text-xs font-medium">
          Giá tiền slot mặc định
        </Label>
        <div className="flex items-center gap-1.5">
          <Input
            id="defaultPrice"
            type="number"
            min="0"
            step="10000"
            value={defaultPrice}
            onChange={(e) => onDefaultPriceChange(Number(e.target.value))}
            className="h-8 text-xs"
          />
          <span className="text-xs text-gray-500 min-w-[40px]">VNĐ</span>
        </div>
      </div>
    </>
  );
};

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduleConfigProps {
  defaultStartTime: string;
  defaultEndTime: string;
  slotDuration: number;
  defaultPrice: number;
  meetingUrl: string;
  meetingUrlError: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onSlotDurationChange: (duration: number) => void;
  onDefaultPriceChange: (price: number) => void;
  onMeetingUrlChange: (url: string) => void;
}

export const ScheduleConfig: React.FC<ScheduleConfigProps> = ({
  defaultStartTime,
  defaultEndTime,
  slotDuration,
  defaultPrice,
  meetingUrl,
  meetingUrlError,
  onStartTimeChange,
  onEndTimeChange,
  onSlotDurationChange,
  onDefaultPriceChange,
  onMeetingUrlChange,
}) => {
  // Generate time options with only :00 and :30 minutes
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs font-medium">Giờ làm việc mặc định</Label>
        <div className="flex items-center gap-1.5">
          <Select value={defaultStartTime} onValueChange={onStartTimeChange}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time} className="text-xs">
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-500">đến</span>
          <Select value={defaultEndTime} onValueChange={onEndTimeChange}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time} className="text-xs">
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <SelectItem value="60">60 phút</SelectItem>
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

      <div className="space-y-1.5">
        <Label htmlFor="meetingUrl" className="text-xs font-medium">
          Link Meeting
        </Label>
        <Input
          id="meetingUrl"
          type="url"
          placeholder="https://meet.google.com/..."
          value={meetingUrl}
          onChange={(e) => onMeetingUrlChange(e.target.value)}
          className={`h-8 text-xs ${meetingUrlError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {meetingUrlError && (
          <p className="text-xs text-red-500 mt-1">{meetingUrlError}</p>
        )}
      </div>
    </>
  );
};

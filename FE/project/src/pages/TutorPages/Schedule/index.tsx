import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DaySchedule, TimeSlot, BookingPlanRequest } from '@/pages/TutorPages/Schedule/type';
import { bookingPlanApi } from '@/pages/TutorPages/Schedule/booking-plan-api';
import { ScheduleConfig } from './components/ScheduleConfig';
import { DaySelection } from './components/DaySelection';
import { DayTimeCustomization } from './components/DayTimeCustomization';
import { ScheduleTable } from './components/ScheduleTable';

const TutorSchedule: React.FC = () => {
  const [defaultStartTime, setDefaultStartTime] = useState('08:00');
  const [defaultEndTime, setDefaultEndTime] = useState('22:00');
  const [slotDuration, setSlotDuration] = useState(60);
  const [defaultPrice, setDefaultPrice] = useState(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { id: 2, name: 'Thứ 2', shortName: 'T2', isEnabled: false, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 3, name: 'Thứ 3', shortName: 'T3', isEnabled: true, startTime: '09:00', endTime: '22:00', slots: [] },
    { id: 4, name: 'Thứ 4', shortName: 'T4', isEnabled: true, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 5, name: 'Thứ 5', shortName: 'T5', isEnabled: true, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 6, name: 'Thứ 6', shortName: 'T6', isEnabled: true, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 7, name: 'Thứ 7', shortName: 'T7', isEnabled: false, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 8, name: 'Chủ nhật', shortName: 'CN', isEnabled: false, startTime: '08:00', endTime: '22:00', slots: [] },
  ]);

  // Auto-apply default time to all days when default time changes
  const handleDefaultStartTimeChange = (time: string) => {
    setDefaultStartTime(time);
    setSchedule(schedule.map(day => ({ ...day, startTime: time })));
  };

  const handleDefaultEndTimeChange = (time: string) => {
    setDefaultEndTime(time);
    setSchedule(schedule.map(day => ({ ...day, endTime: time })));
  };

  const generateTimeSlots = (startTime: string, endTime: string, duration: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes + duration <= endMinutes) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endM = currentMinutes + duration;
      const endH = Math.floor(endM / 60);
      const endMinute = endM % 60;

      slots.push({
        id: `${startH}:${startM.toString().padStart(2, '0')}-${endH}:${endMinute.toString().padStart(2, '0')}`,
        startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
        endTime: `${endH.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
      });

      currentMinutes += duration;
    }

    return slots;
  };

  const getAllTimeSlots = (): string[] => {
    const allSlots = new Set<string>();
    schedule.forEach(day => {
      if (day.isEnabled && day.slots.length > 0) {
        day.slots.forEach(slot => {
          allSlots.add(slot.id);
        });
      }
    });
    return Array.from(allSlots).sort((a, b) => {
      const [aStartTime] = a.split('-');
      const [bStartTime] = b.split('-');
      const [aHour, aMin] = aStartTime.split(':').map(Number);
      const [bHour, bMin] = bStartTime.split(':').map(Number);
      const aMinutes = aHour * 60 + aMin;
      const bMinutes = bHour * 60 + bMin;
      return aMinutes - bMinutes;
    });
  };

  const handleGenerateSchedule = () => {
    const updatedSchedule = schedule.map((day) => ({
      ...day,
      slots: day.isEnabled ? generateTimeSlots(day.startTime, day.endTime, slotDuration) : [],
    }));
    setSchedule(updatedSchedule);
  };

  const handleDayToggle = (dayId: number) => {
    setSchedule(
      schedule.map((day) =>
        day.id === dayId ? { ...day, isEnabled: !day.isEnabled } : day
      )
    );
  };

  const handleDayTimeChange = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(
      schedule.map((day) =>
        day.id === dayId ? { ...day, [field]: value } : day
      )
    );
  };

  const getSlotForTime = (day: DaySchedule, timeId: string): TimeSlot | null => {
    return day.slots.find(slot => slot.id === timeId) || null;
  };

  const handleSubmitSchedule = async () => {
    try {
      setIsSubmitting(true);

      // Validate that at least one day is selected
      const enabledDays = schedule.filter(day => day.isEnabled);
      if (enabledDays.length === 0) {
        toast.error('Vui lòng chọn ít nhất một ngày làm việc');
        return;
      }

      // Validate that schedule has been generated
      if (!enabledDays.some(day => day.slots.length > 0)) {
        toast.error('Vui lòng tạo lịch trước khi gửi');
        return;
      }

      const bookingPlanPromises = enabledDays.map(async (day) => {
        const bookingPlanData: BookingPlanRequest = {
          title: day.shortName,
          start_hours: day.startTime,  // Format: "HH:mm"
          end_hours: day.endTime,      // Format: "HH:mm"
          slot_duration: slotDuration,
          price_per_hours: defaultPrice,
        };
        return bookingPlanApi.createBookingPlan(bookingPlanData);
      });

      await Promise.all(bookingPlanPromises);

      toast.success('Lịch làm việc đã được tạo thành công!');
      
      // Optionally reset the schedule after successful submission
      // setSchedule(initialScheduleState);
    } catch (error) {
      console.error('Error submitting schedule:', error);
      toast.error('Có lỗi xảy ra khi tạo lịch làm việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 h-screen flex flex-col overflow-hidden">
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Schedule</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Panel - Configuration */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-semibold">Cấu hình lịch</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2 text-sm">
            <ScheduleConfig
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              slotDuration={slotDuration}
              defaultPrice={defaultPrice}
              onStartTimeChange={handleDefaultStartTimeChange}
              onEndTimeChange={handleDefaultEndTimeChange}
              onSlotDurationChange={setSlotDuration}
              onDefaultPriceChange={setDefaultPrice}
            />

            <DaySelection
              schedule={schedule}
              onDayToggle={handleDayToggle}
            />

            <DayTimeCustomization
              schedule={schedule}
              onDayTimeChange={handleDayTimeChange}
            />

            <Button
              onClick={handleGenerateSchedule}
              className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
            >
              Xem lịch
            </Button>

            <Button
              onClick={handleSubmitSchedule}
              disabled={isSubmitting || !schedule.some(day => day.isEnabled && day.slots.length > 0)}
              className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'Lưu lịch làm việc'}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel - Schedule Display */}
        <Card className="flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-semibold">Lịch Làm Việc</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
            <ScheduleTable
              schedule={schedule}
              allTimeSlots={getAllTimeSlots()}
              getSlotForTime={getSlotForTime}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TutorSchedule;

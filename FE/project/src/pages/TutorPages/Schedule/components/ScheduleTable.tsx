import React from 'react';
import { DaySchedule, TimeSlot } from '@/pages/TutorPages/Schedule/type';

interface ScheduleTableProps {
  schedule: DaySchedule[];
  allTimeSlots: string[];
  getSlotForTime: (day: DaySchedule, timeId: string) => TimeSlot | null;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedule,
  allTimeSlots,
  getSlotForTime,
}) => {
  const enabledDays = schedule.filter((day) => day.isEnabled);

  if (allTimeSlots.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xs">Chưa có lịch làm việc</p>
          <p className="text-xs mt-1">Vui lòng cấu hình và nhấn "Tạo lịch"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="bg-blue-600 text-white font-semibold text-center py-1.5 border-r border-blue-700 min-w-[80px]">
              Giờ
            </th>
            {enabledDays.map((day) => (
              <th
                key={day.id}
                className="bg-blue-600 text-white font-semibold text-center py-1.5 border-r border-blue-700 last:border-r-0 min-w-[70px]"
              >
                {day.shortName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allTimeSlots.map((timeId) => {
            const [startTime, endTime] = timeId.split('-');
            const [startH, startM] = startTime.split(':');
            const [endH, endM] = endTime.split(':');

            return (
              <tr key={timeId}>
                <td className="bg-gray-50 text-center py-1.5 font-medium border-r border-b border-gray-200 text-gray-700">
                  {startH.padStart(2, '0')}:{startM.padStart(2, '0')}-
                  {endH.padStart(2, '0')}:{endM.padStart(2, '0')}
                </td>
                {enabledDays.map((day) => {
                  const slot = getSlotForTime(day, timeId);

                  return (
                    <td
                      key={`${day.id}-${timeId}`}
                      className={`text-center py-1.5 font-medium border-r border-b border-gray-200 last:border-r-0 ${
                        slot ? 'bg-emerald-50 text-emerald-600' : 'bg-white'
                      }`}
                    >
                      {slot && `${slot.startTime}-${slot.endTime}`}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

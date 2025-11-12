import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarSlotsProps {
  selectedSlots: Array<{ date: string; time: string; day: string }>;
  onSlotsChange: (slots: Array<{ date: string; time: string; day: string }>) => void;
}

const CalendarSlots = ({ selectedSlots, onSlotsChange }: CalendarSlotsProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const timeSlots = [
    { time: '18:00', label: '6:00 PM' },
    { time: '19:00', label: '7:00 PM' },
    { time: '20:00', label: '8:00 PM' }
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSlotSelected = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    return selectedSlots.some(slot => slot.date === dateStr && slot.time === time);
  };

  const isSlotAvailable = (date: Date, time: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return false;

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return false;

    return true;
  };

  const toggleSlot = (date: Date, time: string) => {
    const dateStr = formatDate(date);
    const dayName = weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1];

    if (!isSlotAvailable(date, time)) return;

    const isSelected = isSlotSelected(date, time);

    if (isSelected) {
      onSlotsChange(selectedSlots.filter(slot =>
        !(slot.date === dateStr && slot.time === time)
      ));
    } else {
      onSlotsChange([...selectedSlots, { date: dateStr, time, day: dayName }]);
    }
  };

  const getMonthYearDisplay = () => {
    return currentWeekStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span>Select Available Time Slots</span>
        </h2>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <h3 className="text-lg font-semibold">{getMonthYearDisplay()}</h3>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-200 bg-gray-50 p-3 text-left font-semibold">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </th>
              {weekDates.map((date, index) => {
                const isToday = formatDate(date) === formatDate(new Date());
                return (
                  <th
                    key={index}
                    className={`border border-gray-200 p-3 text-center ${
                      isToday ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold">{weekDays[index]}</div>
                    <div className={`text-sm ${isToday ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                      {date.getDate()}/{date.getMonth() + 1}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot.time}>
                <td className="border border-gray-200 bg-gray-50 p-3 font-medium">
                  {slot.label}
                </td>
                {weekDates.map((date, index) => {
                  const available = isSlotAvailable(date, slot.time);
                  const selected = isSlotSelected(date, slot.time);

                  return (
                    <td
                      key={index}
                      className="border border-gray-200 p-2 text-center"
                    >
                      <button
                        onClick={() => toggleSlot(date, slot.time)}
                        disabled={!available}
                        className={`w-full h-12 rounded-lg font-medium transition-all ${
                          !available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                        }`}
                      >
                        {!available ? 'N/A' : selected ? 'Selected' : 'Available'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">How to book:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click on green "Available" slots to select your preferred time</li>
          <li>• Selected slots will turn blue</li>
          <li>• Each slot is 1 hour long (6 PM - 9 PM daily)</li>
          <li>• Click again to deselect a slot</li>
          <li>• You can select multiple slots across different days</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarSlots;

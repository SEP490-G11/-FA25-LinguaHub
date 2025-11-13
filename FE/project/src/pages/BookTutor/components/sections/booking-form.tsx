import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface BookingFormProps {
  bookingData: {
    courseName: string;
    sessionDate: string;
    sessionTime: string;
    duration: number;
    notes: string;
  };
  onBookingDataChange: (data: any) => void;
  tutorAvailability: string[];
}

const BookingForm = ({ bookingData, onBookingDataChange, tutorAvailability }: BookingFormProps) => {
  const handleChange = (field: string, value: any) => {
    onBookingDataChange({
      ...bookingData,
      [field]: value
    });
  };

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Book Your Session</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course/Topic
          </label>
          <Input
            type="text"
            placeholder="e.g., Business English, IELTS Preparation"
            value={bookingData.courseName}
            onChange={(e) => handleChange('courseName', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Session Date
            </label>
            <Input
              type="date"
              value={bookingData.sessionDate}
              onChange={(e) => handleChange('sessionDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Session Time
            </label>
            <Input
              type="time"
              value={bookingData.sessionTime}
              onChange={(e) => handleChange('sessionTime', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => handleChange('duration', duration.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  bookingData.duration === duration.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tutor Availability
          </label>
          <div className="flex flex-wrap gap-2">
            {tutorAvailability.map((day) => (
              <span
                key={day}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <Textarea
            placeholder="Any specific topics or goals you'd like to cover in this session..."
            value={bookingData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingForm;

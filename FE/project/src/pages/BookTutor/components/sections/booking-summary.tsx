import { Calendar, Clock,  User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingSummaryProps {
  tutor: {
    name: string;
    teachingLanguage?: string | null;
    pricePerHour: number;

  };
  selectedSlots: Array<{ date: string; time: string; day: string }>;
  totalPrice: number | string | undefined;
  onConfirmBooking: () => void;
}

const BookingSummary = ({ tutor, selectedSlots, totalPrice, onConfirmBooking }: BookingSummaryProps) => {

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: Array<{ time: string; day: string }> } = {};
    selectedSlots.forEach(slot => {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push({ time: slot.time, day: slot.day });
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeRange = (time: string) => {
    const [h] = time.split(':');
    const startHour = parseInt(h);
    const endHour = (startHour + 1) % 24;

    const to12H = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const display = hour % 12 === 0 ? 12 : hour % 12;
      return `${display}:00 ${period}`;
    };

    return `${to12H(startHour)} - ${to12H(endHour)}`;
  };

  /**  FIX LỖI — format VND an toàn */
  const formatVND = (value: number | string | undefined) => {
    const num = Number(value);
    if (isNaN(num)) return "0 VND";
    return num.toLocaleString("vi-VN") + " VND";
  };

  return (
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">

        <h3 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span>Booking Summary</span>
        </h3>

        <div className="space-y-4 mb-6">

          {/* TUTOR INFO */}
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Tutor</p>
              <p className="font-semibold text-lg">{tutor.name}</p>
              <p className="text-sm text-gray-500">{tutor.teachingLanguage} Teacher</p>
            </div>
          </div>

          {/* SELECTED SLOTS */}
          {selectedSlots.length > 0 ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Selected Time Slots</span>
                </h4>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(groupedSlots).map(([date, slots]) => (
                      <div key={date} className="border-l-4 border-blue-600 pl-3">
                        <p className="font-semibold text-sm text-gray-700">
                          {formatDate(date)}
                        </p>

                        <div className="space-y-1 mt-1">
                          {slots.map((slot, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">
                          {formatTimeRange(slot.time)}
                        </span>
                              </div>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No slots selected</p>
                <p className="text-sm text-gray-400">
                  Select time slots from the calendar above
                </p>
              </div>
          )}

        </div>

        {/* PRICE SUMMARY */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="space-y-2">

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price per slot (1 hour)</span>
              <span className="font-semibold">
            {formatVND(tutor.pricePerHour)}

            </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Number of slots</span>
              <span className="font-semibold">{selectedSlots.length}</span>
            </div>

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                {formatVND(totalPrice)}
              </span>
              </div>
            </div>

          </div>
        </div>

        <Button
            onClick={onConfirmBooking}
            disabled={selectedSlots.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
        >
          Proceed to Payment ({selectedSlots.length} {selectedSlots.length === 1 ? 'slot' : 'slots'})
        </Button>

        <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
          <p>By booking, you agree to our Terms of Service</p>
          <p>Free cancellation up to 24 hours before session</p>
        </div>

      </div>
  );
};

export default BookingSummary;

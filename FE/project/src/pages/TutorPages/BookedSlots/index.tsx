import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookedSlot } from './types';
import { bookedSlotsApi } from './booked-slots-api';
import { WeekNavigator } from './components/WeekNavigator';
import { BookedSlotsList } from './components/BookedSlotsList';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Helper function to get the start of the week (Sunday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is 0
  return new Date(d.setDate(diff));
};

// Helper function to get the end of the week (Saturday)
const getWeekEnd = (date: Date): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

// Helper function to format date as DD/MM/YYYY
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to get date range string
const getDateRangeString = (weekStart: Date): string => {
  const weekEnd = getWeekEnd(weekStart);
  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
};

// Helper function to check if a date is in the current week
const isCurrentWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = getWeekStart(date);
  const currentWeekStart = getWeekStart(today);
  
  return (
    weekStart.getDate() === currentWeekStart.getDate() &&
    weekStart.getMonth() === currentWeekStart.getMonth() &&
    weekStart.getFullYear() === currentWeekStart.getFullYear()
  );
};

// Helper function to filter slots by week
const filterSlotsByWeek = (slots: BookedSlot[], weekStart: Date): BookedSlot[] => {
  const weekEnd = getWeekEnd(weekStart);
  
  return slots.filter((slot) => {
    const slotDate = new Date(slot.start_time);
    return slotDate >= weekStart && slotDate <= weekEnd;
  });
};

const BookedSlots: React.FC = () => {
  // State management
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booked slots from API
  const fetchBookedSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const slots = await bookedSlotsApi.getMySlots();
      setBookedSlots(slots);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch slots on component mount
  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Handle week navigation
  const handleWeekChange = useCallback((direction: 'prev' | 'next') => {
    setSelectedWeek((prevWeek) => {
      const newWeek = new Date(prevWeek);
      const daysToAdd = direction === 'next' ? 7 : -7;
      newWeek.setDate(prevWeek.getDate() + daysToAdd);
      return newWeek;
    });
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Calculate week data
  const weekStart = getWeekStart(selectedWeek);
  const dateRange = getDateRangeString(weekStart);
  const isThisWeek = isCurrentWeek(selectedWeek);

  // Filter slots for the selected week
  const filteredSlots = filterSlotsByWeek(bookedSlots, weekStart);

  // Show loading state on initial load
  if (isLoading && bookedSlots.length === 0) {
    return (
      <div className="p-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && bookedSlots.length === 0) {
    return (
      <div className="p-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col overflow-hidden">
      {/* Header - matching Schedule page */}
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Booked Slots
        </h1>
      </div>

      {/* Main Content */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Lịch đã đặt
            </CardTitle>
            <Button
              onClick={fetchBookedSlots}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        {/* Week Navigator */}
        <div className="flex-shrink-0">
          <WeekNavigator
            currentWeek={selectedWeek}
            dateRange={dateRange}
            isCurrentWeek={isThisWeek}
            onWeekChange={handleWeekChange}
          />
        </div>

        {/* Slots List */}
        <CardContent className="flex-1 overflow-hidden p-4">
          <BookedSlotsList
            bookedSlots={filteredSlots}
            weekStart={weekStart}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BookedSlots;

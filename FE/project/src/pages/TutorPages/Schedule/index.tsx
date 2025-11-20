import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DaySchedule, TimeSlot, BookingPlanRequest, BookingPlan } from '@/pages/TutorPages/Schedule/type';
import { bookingPlanApi } from '@/pages/TutorPages/Schedule/booking-plan-api';
import { getTutorIdFromToken } from '@/utils/jwt-decode';
import { ScheduleConfig } from './components/ScheduleConfig';
import { DaySelection } from './components/DaySelection';
import { DayTimeCustomization } from './components/DayTimeCustomization';
import { ScheduleTable } from './components/ScheduleTable';
import { BookingPlansList } from './components/BookingPlansList';

const TutorSchedule: React.FC = () => {
  // Default schedule configuration
  const getDefaultSchedule = (): DaySchedule[] => [
    { id: 2, name: 'Thứ 2', shortName: 'T2', isEnabled: false, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 3, name: 'Thứ 3', shortName: 'T3', isEnabled: true, startTime: '09:00', endTime: '22:00', slots: [] },
    { id: 4, name: 'Thứ 4', shortName: 'T4', isEnabled: true, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 5, name: 'Thứ 5', shortName: 'T5', isEnabled: true, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 6, name: 'Thứ 6', shortName: 'T6', isEnabled: true, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 7, name: 'Thứ 7', shortName: 'T7', isEnabled: false, startTime: '08:00', endTime: '22:00', slots: [] },
    { id: 8, name: 'Chủ nhật', shortName: 'CN', isEnabled: false, startTime: '08:00', endTime: '22:00', slots: [] },
  ];

  const [defaultStartTime, setDefaultStartTime] = useState('08:00');
  const [defaultEndTime, setDefaultEndTime] = useState('22:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [defaultPrice, setDefaultPrice] = useState(50000);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingUrlError, setMeetingUrlError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state variables for CRUD functionality
  const [bookingPlans, setBookingPlans] = useState<BookingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<BookingPlan | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced loading states for specific operations
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch existing booking plans on component mount
  useEffect(() => {
    const fetchBookingPlans = async () => {
      try {
        setIsLoading(true);
        const tutorId = getTutorIdFromToken();
        
        if (!tutorId) {
          toast.error('Không tìm thấy thông tin tutor. Vui lòng đăng nhập lại.');
          return;
        }

        const response = await bookingPlanApi.getBookingPlans(tutorId);
        setBookingPlans(response.plans);
      } catch (error) {
        console.error('Error fetching booking plans:', error);
        // Enhanced error handling with specific error message from API
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải danh sách lịch làm việc.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingPlans();
  }, []);

  // Function to enter edit mode with existing booking plan data
  const handleEditBookingPlan = useCallback((plan: BookingPlan) => {
    setEditingPlan(plan);
    setIsEditMode(true);
    
    // Populate form with existing booking plan data
    const startTime = `${plan.start_hours.hour.toString().padStart(2, '0')}:${plan.start_hours.minute.toString().padStart(2, '0')}`;
    const endTime = `${plan.end_hours.hour.toString().padStart(2, '0')}:${plan.end_hours.minute.toString().padStart(2, '0')}`;
    
    setDefaultStartTime(startTime);
    setDefaultEndTime(endTime);
    setSlotDuration(plan.slot_duration);
    setDefaultPrice(plan.price_per_hours);
    setMeetingUrl(plan.meeting_url);
    
    // Update schedule to reflect the editing plan's day
    // Note: This assumes the plan title corresponds to day shortName
    setSchedule(prevSchedule => 
      prevSchedule.map(day => ({
        ...day,
        isEnabled: day.shortName === plan.title,
        startTime: startTime,
        endTime: endTime
      }))
    );
  }, []);

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    setDefaultStartTime('08:00');
    setDefaultEndTime('22:00');
    setSlotDuration(30);
    setDefaultPrice(50000);
    setMeetingUrl('');
    setMeetingUrlError('');
    setSchedule(getDefaultSchedule());
  }, []);

  // Function to exit edit mode
  const handleCancelEdit = useCallback(() => {
    // Clear editing state properly
    setEditingPlan(null);
    setIsEditMode(false);
    
    // Reset form to default values
    resetFormToDefaults();
  }, [resetFormToDefaults]);

  // Function to delete booking plan with enhanced error handling
  const handleDeleteBookingPlan = useCallback(async (planId: number) => {
    try {
      setIsDeleting(true);
      const response = await bookingPlanApi.deleteBookingPlan(planId);
      
      if (response.success) {
        // Find the deleted plan for better success message
        const deletedPlan = bookingPlans.find(plan => plan.booking_planid === planId);
        const planTitle = deletedPlan ? deletedPlan.title : 'lịch làm việc';
        
        // Remove the deleted plan from local state
        setBookingPlans(prevPlans => prevPlans.filter(plan => plan.booking_planid !== planId));
        
        // Enhanced success message with API message and plan details
        const successMessage = response.message 
          ? `🗑️ ${response.message} (${planTitle})`
          : `🗑️ Xóa lịch làm việc "${planTitle}" thành công!`;
        
        toast.success(successMessage, {
          duration: 4000,
        });
      } else {
        toast.error('Có lỗi xảy ra khi xóa lịch làm việc.');
      }
    } catch (error) {
      console.error('Error deleting booking plan:', error);
      // Enhanced error handling with specific error message from API
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa lịch làm việc. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [bookingPlans]);

  const [schedule, setSchedule] = useState<DaySchedule[]>(getDefaultSchedule());

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

  const validateMeetingUrl = (url: string): boolean => {
    if (!url.trim()) {
      setMeetingUrlError('Vui lòng nhập link meeting');
      return false;
    }

    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        setMeetingUrlError('Link meeting phải bắt đầu bằng http:// hoặc https://');
        return false;
      }
      setMeetingUrlError('');
      return true;
    } catch {
      setMeetingUrlError('Link meeting không hợp lệ');
      return false;
    }
  };

  const handleMeetingUrlChange = (url: string) => {
    setMeetingUrl(url);
    if (meetingUrlError && url.trim()) {
      validateMeetingUrl(url);
    }
  };

  const handleSubmitSchedule = async () => {
    try {
      setIsSubmitting(true);

      // Validate meeting URL
      if (!validateMeetingUrl(meetingUrl)) {
        return;
      }

      if (isEditMode && editingPlan) {
        // UPDATE MODE: Update existing booking plan
        setIsUpdating(true);
        
        const [startHour, startMinute] = defaultStartTime.split(':').map(Number);
        const [endHour, endMinute] = defaultEndTime.split(':').map(Number);

        const bookingPlanData: BookingPlanRequest = {
          title: editingPlan.title,
          start_hours: {
            hour: startHour,
            minute: startMinute,
            second: 0,
            nano: 0,
          },
          end_hours: {
            hour: endHour,
            minute: endMinute,
            second: 0,
            nano: 0,
          },
          slot_duration: slotDuration,
          price_per_hours: defaultPrice,
          meeting_url: meetingUrl,
        };

        const response = await bookingPlanApi.updateBookingPlan(editingPlan.booking_planid, bookingPlanData);
        
        if (response.success) {
          // Enhanced success message with more details
          const successMessage = response.updated_slots > 0 
            ? `✅ Cập nhật lịch làm việc "${editingPlan.title}" thành công! Đã cập nhật ${response.updated_slots} slots.`
            : `✅ Cập nhật lịch làm việc "${editingPlan.title}" thành công!`;
          
          toast.success(successMessage, {
            duration: 4000,
          });
          
          // Refresh booking plans list after successful update
          await refreshBookingPlans();
          
          // Exit edit mode and reset form
          handleCancelEdit();
        } else {
          toast.error('Có lỗi xảy ra khi cập nhật lịch làm việc.');
        }
      } else {
        // CREATE MODE: Create new booking plans
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

        // Create booking plans for each enabled day
        const bookingPlanPromises = enabledDays.map(async (day) => {
          const [startHour, startMinute] = day.startTime.split(':').map(Number);
          const [endHour, endMinute] = day.endTime.split(':').map(Number);

          const bookingPlanData: BookingPlanRequest = {
            title: day.shortName,
            start_hours: {
              hour: startHour,
              minute: startMinute,
              second: 0,
              nano: 0,
            },
            end_hours: {
              hour: endHour,
              minute: endMinute,
              second: 0,
              nano: 0,
            },
            slot_duration: slotDuration,
            price_per_hours: defaultPrice,
            meeting_url: meetingUrl,
          };

          return bookingPlanApi.createBookingPlan(bookingPlanData);
        });

        const responses = await Promise.all(bookingPlanPromises);

        // Calculate total slots created
        const totalSlots = responses.reduce((sum, res) => sum + res.slots_created, 0);
        const createdPlansCount = responses.length;

        // Enhanced success message with more details
        const successMessage = `🎉 Tạo lịch làm việc thành công! Đã tạo ${createdPlansCount} lịch với tổng cộng ${totalSlots} slots.`;
        
        toast.success(successMessage, {
          duration: 5000,
        });
        
        // Refresh booking plans list after successful creation
        await refreshBookingPlans();
      }
    } catch (error) {
      console.error('Error submitting schedule:', error);
      // Enhanced error handling with specific error message from API
      const errorMessage = error instanceof Error ? error.message : 
        (isEditMode ? 'Có lỗi xảy ra khi cập nhật lịch làm việc. Vui lòng thử lại.' : 'Có lỗi xảy ra khi tạo lịch làm việc. Vui lòng thử lại.');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUpdating(false);
    }
  };

  // Helper function to refresh booking plans list with enhanced error handling
  const refreshBookingPlans = useCallback(async (showSuccessMessage = false) => {
    const tutorId = getTutorIdFromToken();
    if (tutorId && !isRefreshing) {
      try {
        setIsRefreshing(true);
        const updatedPlans = await bookingPlanApi.getBookingPlans(tutorId);
        setBookingPlans(updatedPlans.plans);
        
        // Optional success feedback for manual refresh
        if (showSuccessMessage) {
          toast.success(`📋 Đã tải lại danh sách lịch làm việc (${updatedPlans.plans.length} lịch)`, {
            duration: 2000,
          });
        }
      } catch (error) {
        console.error('Error refreshing booking plans:', error);
        // Enhanced error handling with specific error message from API
        const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải lại danh sách lịch làm việc.';
        toast.error(errorMessage);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing]);

  return (
    <div className="p-4 h-screen flex flex-col overflow-hidden">
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Schedule</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr,300px] gap-3 flex-1 overflow-hidden min-h-0">
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
              meetingUrl={meetingUrl}
              meetingUrlError={meetingUrlError}
              onStartTimeChange={handleDefaultStartTimeChange}
              onEndTimeChange={handleDefaultEndTimeChange}
              onSlotDurationChange={setSlotDuration}
              onDefaultPriceChange={setDefaultPrice}
              onMeetingUrlChange={handleMeetingUrlChange}
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
              disabled={isSubmitting || isUpdating || isDeleting || isRefreshing || !schedule.some(day => day.isEnabled && day.slots.length > 0)}
              className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs disabled:opacity-50"
            >
              {isSubmitting ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...') : (isEditMode ? 'Cập nhật' : 'Lưu lịch làm việc')}
            </Button>

            {isEditMode && (
              <Button
                onClick={handleCancelEdit}
                disabled={isSubmitting || isUpdating || isDeleting}
                className="w-full bg-gray-600 hover:bg-gray-700 h-8 text-xs disabled:opacity-50"
              >
                Hủy chỉnh sửa
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Middle Panel - Schedule Display */}
        <Card className="flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-semibold">Lịch Làm Việc</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
            <ScheduleTable
              schedule={schedule}
              getSlotForTime={getSlotForTime}
              bookingPlans={bookingPlans}
              isEditMode={isEditMode}
            />
          </CardContent>
        </Card>

        {/* Right Panel - Booking Plans List */}
        <div className="flex flex-col overflow-hidden">
          <BookingPlansList
            bookingPlans={bookingPlans}
            isLoading={isLoading || isRefreshing}
            isDeleting={isDeleting}
            onEdit={handleEditBookingPlan}
            onDelete={handleDeleteBookingPlan}
            onRefresh={() => refreshBookingPlans(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default TutorSchedule;

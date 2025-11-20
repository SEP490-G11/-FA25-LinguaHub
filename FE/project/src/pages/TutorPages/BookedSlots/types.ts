// Type definitions for Booked Slots Management

export type SlotStatus = 'Available' | 'Booked' | 'Completed' | 'Cancelled';

export interface BookedSlot {
  slotid: number;
  booking_planid: number;
  tutor_id: number;
  user_id: number;
  start_time: string;        // ISO 8601 format
  end_time: string;          // ISO 8601 format
  status: SlotStatus;
  learner_name: string;
  meeting_url: string | null;
  payment_id: number | null;
  locked_at: string | null;
  expires_at: string | null;
}

export interface BookedSlotsResponse {
  code: number;
  message: string;
  result: BookedSlot[];
}

export interface DayGroup {
  date: Date;
  dayName: string;
  dayLabel: string;        // e.g., "Thứ 2, 16/11/2025"
  isToday: boolean;
  slots: BookedSlot[];
}

export interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  dateRange: string;       // e.g., "16/11/2025 - 22/11/2025"
  dayGroups: DayGroup[];
}

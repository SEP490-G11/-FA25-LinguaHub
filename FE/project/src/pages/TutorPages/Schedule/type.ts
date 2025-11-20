export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  id: number;
  name: string;
  shortName: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  slots: TimeSlot[];
}

export interface TimeObject {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface BookingPlanRequest {
  title: string;
  start_hours: TimeObject;
  end_hours: TimeObject;
  slot_duration: number;
  price_per_hours: number;
  meeting_url: string;
}

export interface BookingPlanResponse {
  success: boolean;
  booking_planid: number;
  slots_created: number;
}

export interface BookingPlan {
  title: string;
  createdAt: string;
  updatedAt: string;
  booking_planid: number;
  tutor_id: number;
  start_hours: TimeObject;
  end_hours: TimeObject;
  slot_duration: number;
  price_per_hours: number;
  meeting_url: string;
  is_open: boolean;
  is_active: boolean;
}

export interface BookingPlansResponse {
  tutor_id: number;
  plans: BookingPlan[];
}

export interface UpdateBookingPlanResponse {
  success: boolean;
  updated_slots: number;
}

export interface DeleteBookingPlanResponse {
  success: boolean;
  message: string;
}

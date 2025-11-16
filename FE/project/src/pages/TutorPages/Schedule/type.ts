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
  // meeting_url: string;
}

export interface BookingPlanResponse {
  id: number;
  title: string;
  start_hours: TimeObject;
  end_hours: TimeObject;
  slot_duration: number;
  price_per_hours: number;
  // meeting_url: string;
  createdAt: string;
}

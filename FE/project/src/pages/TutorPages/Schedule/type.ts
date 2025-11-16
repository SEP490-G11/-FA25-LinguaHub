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



export interface BookingPlanRequest {
  title: string;
  start_hours: string;  // Format: "HH:mm"
  end_hours: string;    // Format: "HH:mm"
  slot_duration: number;
  price_per_hours: number;
}

export interface BookingPlanResponse {
  id: number;
  title: string;
  start_hours: string;  // Format: "HH:mm"
  end_hours: string;    // Format: "HH:mm"
  slot_duration: number;
  price_per_hours: number;
  createdAt: string;
}

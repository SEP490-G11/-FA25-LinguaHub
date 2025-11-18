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
  startHours: number;
  endHours: number;
  slotDuration: number;
  pricePerHours: number;
}

export interface BookingPlanResponse {
  id: number;
  title: string;
  startHours: number;
  endHours: number;
  slotDuration: number;
  pricePerHours: number;
  createdAt: string;
}

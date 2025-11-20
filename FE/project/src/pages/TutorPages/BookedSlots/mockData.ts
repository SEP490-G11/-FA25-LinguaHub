import { BookedSlot, SlotStatus } from './types';

// Helper function to generate mock data for 30 days with at least 2 slots per day
const generateMockBookedSlots = (): BookedSlot[] => {
  const slots: BookedSlot[] = [];
  const learnerNames = [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E',
    'Vũ Thị F', 'Đỗ Văn G', 'Bùi Thị H', 'Đinh Văn I', 'Mai Thị K',
    'Lý Văn L', 'Phan Thị M', 'Dương Văn N', 'Võ Thị O', 'Trương Văn P',
    'Hồ Thị Q', 'Đặng Văn R', 'Cao Thị S', 'Tô Văn T', 'Lâm Thị U',
  ];
  
  const meetingUrls = [
    'https://meet.google.com/abc-defg-hij',
    'https://zoom.us/j/123456789',
    'https://meet.google.com/xyz-uvwx-rst',
    'https://meet.google.com/tuv-wxyz-abc',
    'https://zoom.us/j/987654321',
    'https://meet.google.com/def-ghi-jkl',
    'https://meet.google.com/mno-pqr-stu',
    'https://zoom.us/j/456789123',
    'https://meet.google.com/vwx-yza-bcd',
    'https://meet.google.com/efg-hij-klm',
  ];
  
  const timeSlots = [
    { start: 9, end: 10 },
    { start: 10, end: 11 },
    { start: 11, end: 12 },
    { start: 13, end: 14 },
    { start: 14, end: 15 },
    { start: 15, end: 16 },
    { start: 16, end: 17 },
    { start: 17, end: 18 },
    { start: 19, end: 20 },
    { start: 20, end: 21 },
  ];
  
  const statuses: SlotStatus[] = ['Booked', 'Booked', 'Booked', 'Completed', 'Cancelled'];
  
  let slotId = 1;
  
  // Generate slots for 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    
    // Generate 2-4 slots per day
    const slotsPerDay = 2 + Math.floor(Math.random() * 3); // 2-4 slots
    
    for (let slotIndex = 0; slotIndex < slotsPerDay; slotIndex++) {
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const learnerName = learnerNames[Math.floor(Math.random() * learnerNames.length)];
      const meetingUrl = status === 'Cancelled' ? null : meetingUrls[Math.floor(Math.random() * meetingUrls.length)];
      
      // Create start and end times
      const startTime = new Date(date);
      startTime.setHours(timeSlot.start, 0, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(timeSlot.end, 0, 0, 0);
      
      slots.push({
        slotid: slotId++,
        booking_planid: 100 + (dayOffset % 7),
        tutor_id: 1,
        user_id: 200 + slotId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: status,
        learner_name: learnerName,
        meeting_url: meetingUrl,
        payment_id: status === 'Cancelled' ? null : 300 + slotId,
        locked_at: status === 'Cancelled' ? null : new Date().toISOString(),
        expires_at: null,
      });
    }
  }
  
  // Sort by start time
  return slots.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
};

// Mock data for testing BookedSlots UI
// This data represents slots across 30 days with at least 2 slots per day
export const mockBookedSlots: BookedSlot[] = generateMockBookedSlots();

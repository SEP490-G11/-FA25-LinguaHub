package edu.lms.service;

import edu.lms.dto.response.ScheduleResponse;
import edu.lms.entity.Schedule;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.ScheduleRepository;
import edu.lms.repository.TutorRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class ScheduleService {

    ScheduleRepository scheduleRepository;
    TutorRepository tutorRepository;

    /**
     * Lấy lịch dạy của tutor theo tuần
     * @param tutorID ID của tutor
     * @param week Số tuần: 0 = tuần hiện tại, 1 = tuần sau, 2 = tuần sau nữa, ...
     *              Ví dụ: Nếu tutor tạo booking plan với weekToGenerate=4, 
     *              thì có thể xem lịch của tuần 0, 1, 2, 3
     * @return Danh sách schedules trong tuần đó (từ thứ 2 đến chủ nhật)
     */
    public List<ScheduleResponse> getSchedulesByTutor(Long tutorID, Integer week) {
        // Validate tutor exists
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        // Calculate the target week (0 = current week, 1 = next week, 2 = week after next, etc.)
        // If tutor created booking plan with weekToGenerate=4, schedules are available for week 0, 1, 2, 3
        LocalDateTime now = LocalDateTime.now();
        
        // Get the date for the target week (week weeks from now)
        LocalDateTime targetDate = now.plusWeeks(week);
        
        // Calculate Monday of that week (DayOfWeek.MONDAY = 1)
        int daysUntilMonday = targetDate.getDayOfWeek().getValue() - 1;
        LocalDateTime weekStart = targetDate.minusDays(daysUntilMonday)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        // Sunday at end of day
        LocalDateTime weekEnd = weekStart.plusDays(6)
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        List<Schedule> schedules = scheduleRepository.findByTutorAndTimeRange(tutorID, weekStart, weekEnd);

        return schedules.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ScheduleResponse mapToResponse(Schedule schedule) {
        return ScheduleResponse.builder()
                .scheduleID(schedule.getScheduleID())
                .tutorID(schedule.getTutor().getTutorID())
                .bookingPlanID(schedule.getBookingPlan().getBookingPlanID())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .isAvailable(schedule.getIsAvailable())
                .build();
    }
}


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

    public List<ScheduleResponse> getSchedulesByTutor(Long tutorID, Integer week) {
        // Validate tutor exists
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        // Get schedules for the specified week (0 = current week, 1 = next week, -1 = previous week, etc.)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.plusWeeks(week).withHour(0).withMinute(0).withSecond(0).withNano(0);
        // Get Monday of the week
        weekStart = weekStart.minusDays(weekStart.getDayOfWeek().getValue() - 1);
        LocalDateTime weekEnd = weekStart.plusDays(6).withHour(23).withMinute(59).withSecond(59);

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


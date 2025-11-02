package edu.lms.service;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import edu.lms.entity.Schedule;
import edu.lms.entity.Tutor;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.TutorBookingPlanMapper;
import edu.lms.repository.BookingPlanRepository;
import edu.lms.repository.ScheduleRepository;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.UserBookingPlanRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TutorBookingPlanService {

    BookingPlanRepository bookingPlanRepository;
    TutorRepository tutorRepository;
    UserBookingPlanRepository userBookingPlanRepository;
    ScheduleRepository scheduleRepository;
    TutorBookingPlanMapper mapper;

    // CREATE
    public TutorBookingPlanResponse createBookingPlan(TutorBookingPlanRequest request) {
        Tutor tutor = tutorRepository.findById(request.getTutorID())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        // Validate tutor status
        if (tutor.getStatus() != TutorStatus.APPROVED)
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);

        // Validate startHour < endHour
        if (request.getStartHour() >= request.getEndHour()) {
            throw new AppException(ErrorCode.INVALID_KEY); // TODO: Add specific error code
        }

        // Validate slotDuration is divisible by total teaching minutes per day
        int totalMinutes = (request.getEndHour() - request.getStartHour()) * 60;
        if (totalMinutes % request.getSlotDuration() != 0) {
            throw new AppException(ErrorCode.INVALID_KEY); // TODO: Add specific error code for slot duration
        }

        // Check for overlapping booking plans
        validateNoOverlappingPlans(tutor, request.getStartHour(), request.getEndHour(), 
                                   request.getActiveDays());

        // Create booking plan
        BookingPlan bookingPlan = mapper.toEntity(request);
        bookingPlan.setTutor(tutor);
        bookingPlanRepository.save(bookingPlan);

        // Generate schedules
        int numberOfSlots = generateSchedules(bookingPlan, request);

        // Update response with number of generated slots
        TutorBookingPlanResponse response = mapper.toResponse(bookingPlan);
        response.setNumberOfGeneratedSlots(numberOfSlots);
        response.setWeekToGenerate(request.getWeekToGenerate());
        
        return response;
    }

    private void validateNoOverlappingPlans(Tutor tutor, Integer startHour, Integer endHour, String activeDays) {
        List<BookingPlan> existingPlans = bookingPlanRepository.findByTutor(tutor);
        List<String> newActiveDays = Arrays.asList(activeDays.split(","));

        for (BookingPlan plan : existingPlans) {
            List<String> planActiveDays = Arrays.asList(plan.getActiveDays().split(","));
            
            // Check if there's any day overlap
            boolean hasDayOverlap = newActiveDays.stream().anyMatch(planActiveDays::contains);
            
            if (hasDayOverlap) {
                // Check time overlap
                boolean timeOverlaps = !(startHour >= plan.getEndHour() || endHour <= plan.getStartHour());
                
                if (timeOverlaps) {
                    throw new AppException(ErrorCode.BOOKING_TIME_CONFLICT);
                }
            }
        }
    }

    private int generateSchedules(BookingPlan bookingPlan, TutorBookingPlanRequest request) {
        List<Schedule> schedules = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        int weeksToGenerate = request.getWeekToGenerate();
        
        List<String> activeDaysList = Arrays.stream(request.getActiveDays().split(","))
                .map(String::trim)
                .collect(Collectors.toList());

        // Convert day names to DayOfWeek
        List<DayOfWeek> dayOfWeeks = activeDaysList.stream()
                .map(this::parseDayOfWeek)
                .collect(Collectors.toList());

        // Generate slots for each week
        for (int week = 0; week < weeksToGenerate; week++) {
            // Get Monday of the target week
            LocalDate targetWeekMonday = today.plusWeeks(week).with(DayOfWeek.MONDAY);
            
            // For each active day in the week
            for (DayOfWeek dayOfWeek : dayOfWeeks) {
                // Calculate the date of the target day in this week
                LocalDate targetDate = targetWeekMonday.plusDays(dayOfWeek.getValue() - DayOfWeek.MONDAY.getValue());
                
                // Skip if the date is in the past (only check date, not time)
                if (targetDate.isBefore(today)) {
                    continue;
                }
                
                // Generate slots for this day
                LocalTime startTimeOfDay = LocalTime.of(request.getStartHour(), 0);
                LocalTime endTimeOfDay = LocalTime.of(request.getEndHour(), 0);
                
                LocalTime currentSlotStart = startTimeOfDay;
                
                while (currentSlotStart.plusMinutes(request.getSlotDuration()).isBefore(endTimeOfDay) ||
                       currentSlotStart.plusMinutes(request.getSlotDuration()).equals(endTimeOfDay)) {
                    
                    LocalTime currentSlotEnd = currentSlotStart.plusMinutes(request.getSlotDuration());
                    
                    LocalDateTime slotStart = LocalDateTime.of(targetDate, currentSlotStart);
                    LocalDateTime slotEnd = LocalDateTime.of(targetDate, currentSlotEnd);
                    
                    // Skip if slot is in the past (check both date and time)
                    if (slotStart.isBefore(now)) {
                        continue;
                    }
                    
                    // Check for overlapping schedules
                    List<Schedule> overlapping = scheduleRepository.findOverlappingSchedules(
                            bookingPlan.getTutor().getTutorID(), slotStart, slotEnd);
                    
                    if (overlapping.isEmpty()) {
                        Schedule schedule = Schedule.builder()
                                .tutor(bookingPlan.getTutor())
                                .bookingPlan(bookingPlan)
                                .startTime(slotStart)
                                .endTime(slotEnd)
                                .isAvailable(true)
                                .build();
                        schedules.add(schedule);
                    }
                    
                    currentSlotStart = currentSlotStart.plusMinutes(request.getSlotDuration());
                }
            }
        }

        // Save all schedules
        scheduleRepository.saveAll(schedules);
        return schedules.size();
    }

    private DayOfWeek parseDayOfWeek(String dayName) {
        switch (dayName.toUpperCase()) {
            case "MON": return DayOfWeek.MONDAY;
            case "TUE": return DayOfWeek.TUESDAY;
            case "WED": return DayOfWeek.WEDNESDAY;
            case "THU": return DayOfWeek.THURSDAY;
            case "FRI": return DayOfWeek.FRIDAY;
            case "SAT": return DayOfWeek.SATURDAY;
            case "SUN": return DayOfWeek.SUNDAY;
            default:
                throw new AppException(ErrorCode.INVALID_KEY); // TODO: Add specific error code
        }
    }

    // READ (BY TUTOR)
    public List<TutorBookingPlanResponse> getBookingPlansByTutor(Long tutorID) {
        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
        return bookingPlanRepository.findByTutor(tutor)
                .stream().map(mapper::toResponse).toList();
    }

    // READ (ALL)
    public List<TutorBookingPlanResponse> getAllBookingPlans() {
        return bookingPlanRepository.findAll()
                .stream().map(mapper::toResponse).toList();
    }

    // READ (BY ID)
    public TutorBookingPlanResponse getBookingPlanById(Long id) {
        BookingPlan bookingPlan = bookingPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        return mapper.toResponse(bookingPlan);
    }

    // UPDATE
    public TutorBookingPlanResponse updateBookingPlan(Long id, TutorBookingPlanRequest request) {
        BookingPlan bookingPlan = bookingPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        bookingPlan.setTitle(request.getTitle());
        bookingPlan.setDescription(request.getDescription());
        bookingPlan.setSlotDuration(request.getSlotDuration());
        bookingPlan.setPricePerSlot(request.getPricePerSlot());
        bookingPlan.setStartHour(request.getStartHour());
        bookingPlan.setEndHour(request.getEndHour());
        bookingPlan.setActiveDays(request.getActiveDays());
        bookingPlan.setWeekToGenerate(request.getWeekToGenerate());
        bookingPlan.setMaxLearners(request.getMaxLearners());

        bookingPlanRepository.save(bookingPlan);
        return mapper.toResponse(bookingPlan);
    }

    // DELETE
    public void deleteBookingPlan(Long id) {
        if (userBookingPlanRepository.existsByBookingPlan_BookingPlanID(id))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        bookingPlanRepository.deleteById(id);
    }
}

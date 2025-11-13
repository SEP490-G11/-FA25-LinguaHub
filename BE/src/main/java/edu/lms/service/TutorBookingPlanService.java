package edu.lms.service;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.BookingPlanSlotResponse;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import edu.lms.entity.BookingPlanSlot;
import edu.lms.entity.Tutor;
import edu.lms.entity.User;
import edu.lms.enums.SlotStatus;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.TutorBookingPlanMapper;
import edu.lms.repository.BookingPlanRepository;
import edu.lms.repository.BookingPlanSlotRepository;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.UserRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TutorBookingPlanService {

    BookingPlanRepository bookingPlanRepository;
    BookingPlanSlotRepository bookingPlanSlotRepository;
    TutorRepository tutorRepository;
    UserRepository userRepository;
    TutorBookingPlanMapper mapper;

    /**
     * Tạo booking plan mới
     * @param request Request tạo booking plan
     * @return Response với thông tin booking plan
     */
    public TutorBookingPlanResponse createBookingPlan(TutorBookingPlanRequest request) {
        // Validate và lấy tutor
        Tutor tutor = tutorRepository.findById(request.getTutorID())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        // Validate tutor status - chỉ tutor đã APPROVED mới được tạo booking plan
        if (tutor.getStatus() != TutorStatus.APPROVED) {
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);
        }

        // Validate startHours < endHours
        if (request.getStartHours() >= request.getEndHours()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        // Validate slotDuration chia hết cho tổng số phút trong ngày
        int totalMinutes = (request.getEndHours() - request.getStartHours()) * 60;
        if (totalMinutes % request.getSlotDuration() != 0) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        // Check overlap với các booking plan khác của tutor (cùng title/ngày)
        validateNoOverlappingPlans(request.getTutorID(), request.getTitle(), 
                                  request.getStartHours(), request.getEndHours());

        // Tạo booking plan
        BookingPlan bookingPlan = mapper.toEntity(request);
        bookingPlan.setTutorID(request.getTutorID());
        bookingPlan.setCreatedAt(LocalDateTime.now());
        bookingPlan.setUpdatedAt(LocalDateTime.now());
        bookingPlan = bookingPlanRepository.save(bookingPlan);

        // Tự động tìm thứ đó của tuần hiện tại/tuần tới và generate slots
        LocalDate targetDate = findTargetDateFromTitle(request.getTitle());
        int numberOfSlots = generateSlotsForDate(bookingPlan, request, targetDate);

        // Tạo response
        TutorBookingPlanResponse response = mapper.toResponse(bookingPlan);
        response.setNumberOfGeneratedSlots(numberOfSlots);

        return response;
    }

    /**
     * Validate không có booking plans trùng lặp (cùng tutor, cùng title/ngày, cùng giờ)
     */
    private void validateNoOverlappingPlans(Long tutorID, String title, 
                                           Integer startHours, Integer endHours) {
        List<BookingPlan> overlappingPlans = bookingPlanRepository.findOverlappingPlans(
                tutorID, title, startHours, endHours);

        if (!overlappingPlans.isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_TIME_CONFLICT);
        }
    }

    /**
     * Tìm ngày của thứ trong tuần hiện tại hoặc tuần tới
     * @param title Title của booking plan (T2, T3, T4, T5, T6, T7, CN)
     * @return LocalDate của thứ đó trong tuần hiện tại hoặc tuần tới
     */
    private LocalDate findTargetDateFromTitle(String title) {
        // Convert title (T2, T3, ...) sang DayOfWeek
        DayOfWeek targetDayOfWeek = parseTitleToDayOfWeek(title);
        
        LocalDate today = LocalDate.now();
        
        // Tìm thứ đó của tuần hiện tại
        LocalDate targetDate = today.with(targetDayOfWeek);
        
        // Nếu thứ đó của tuần này đã qua, lấy thứ đó của tuần tới
        if (targetDate.isBefore(today)) {
            targetDate = targetDate.plusWeeks(1);
        }
        
        return targetDate;
    }

    /**
     * Parse title (T2, T3, T4, T5, T6, T7, CN) sang DayOfWeek enum
     * @param title Title của booking plan
     * @return DayOfWeek enum
     */
    private DayOfWeek parseTitleToDayOfWeek(String title) {
        return switch (title.toUpperCase()) {
            case "T2" -> DayOfWeek.MONDAY;
            case "T3" -> DayOfWeek.TUESDAY;
            case "T4" -> DayOfWeek.WEDNESDAY;
            case "T5" -> DayOfWeek.THURSDAY;
            case "T6" -> DayOfWeek.FRIDAY;
            case "T7" -> DayOfWeek.SATURDAY;
            case "CN" -> DayOfWeek.SUNDAY;
            default -> throw new AppException(ErrorCode.INVALID_KEY);
        };
    }

    /**
     * Generate slots cho một ngày cụ thể
     * @param bookingPlan Booking plan đã được tạo
     * @param request Request chứa thông tin để generate
     * @param targetDate Ngày cụ thể để generate slots
     * @return Số lượng slots đã được generate
     */
    private int generateSlotsForDate(BookingPlan bookingPlan, TutorBookingPlanRequest request, LocalDate targetDate) {
        List<BookingPlanSlot> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Generate slots cho ngày đó
        LocalTime startTimeOfDay = LocalTime.of(request.getStartHours(), 0);
        LocalTime endTimeOfDay = LocalTime.of(request.getEndHours(), 0);

        LocalTime currentSlotStart = startTimeOfDay;

        while (currentSlotStart.plusMinutes(request.getSlotDuration()).isBefore(endTimeOfDay) ||
               currentSlotStart.plusMinutes(request.getSlotDuration()).equals(endTimeOfDay)) {

            LocalTime currentSlotEnd = currentSlotStart.plusMinutes(request.getSlotDuration());

            LocalDateTime slotStart = LocalDateTime.of(targetDate, currentSlotStart);
            LocalDateTime slotEnd = LocalDateTime.of(targetDate, currentSlotEnd);

            // Skip nếu slot đã qua (check cả date và time)
            if (slotStart.isBefore(now)) {
                currentSlotStart = currentSlotStart.plusMinutes(request.getSlotDuration());
                continue;
            }

            // Check overlap với slots đã có
            boolean exists = bookingPlanSlotRepository.existsByTutorIDAndStartTimeAndEndTime(
                    bookingPlan.getTutorID(), slotStart, slotEnd);

            // Chỉ tạo slot nếu không overlap
            if (!exists) {
                BookingPlanSlot slot = BookingPlanSlot.builder()
                        .bookingPlanID(bookingPlan.getBookingPlanID())
                        .tutorID(bookingPlan.getTutorID())
                        .userID(null) // Chưa có learner book
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .paymentID(null) // Chưa có payment
                        .status(SlotStatus.Locked) // Mặc định là Locked
                        .lockedAt(LocalDateTime.now())
                        .expiresAt(null) // Có thể set sau
                        .build();
                slots.add(slot);
            }

            currentSlotStart = currentSlotStart.plusMinutes(request.getSlotDuration());
        }

        // Lưu tất cả slots
        bookingPlanSlotRepository.saveAll(slots);
        return slots.size();
    }


    /**
     * Lấy danh sách booking plan của 1 tutor
     */
    public List<TutorBookingPlanResponse> getBookingPlansByTutor(Long tutorID) {
        return bookingPlanRepository.findByTutorID(tutorID)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Lấy tất cả booking plan trong hệ thống
     */
    public List<TutorBookingPlanResponse> getAllBookingPlans() {
        return bookingPlanRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    /**
     * Lấy chi tiết booking plan theo ID
     */
    public TutorBookingPlanResponse getBookingPlanById(Long id) {
        BookingPlan bookingPlan = bookingPlanRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));
        return mapper.toResponse(bookingPlan);
    }

    /**
     * Lấy tất cả slots của tutor
     */
    public List<BookingPlanSlotResponse> getSlotsByTutor(Long tutorID) {
        // Validate tutor tồn tại
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findByTutorIDOrderByStartTimeAsc(tutorID);
        return mapToSlotResponses(slots);
    }

    /**
     * Lấy slots của tutor theo booking plan
     */
    public List<BookingPlanSlotResponse> getSlotsByBookingPlan(Long tutorID, Long bookingPlanID) {
        // Validate tutor và booking plan
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));
        
        BookingPlan bookingPlan = bookingPlanRepository.findById(bookingPlanID)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        // Kiểm tra booking plan thuộc về tutor
        if (!bookingPlan.getTutorID().equals(tutorID)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<BookingPlanSlot> slots = bookingPlanSlotRepository
                .findByTutorIDAndBookingPlanIDOrderByStartTimeAsc(tutorID, bookingPlanID);
        return mapToSlotResponses(slots);
    }

    /**
     * Lấy slots của tutor theo status
     */
    public List<BookingPlanSlotResponse> getSlotsByStatus(Long tutorID, SlotStatus status) {
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository
                .findByTutorIDAndStatusOrderByStartTimeAsc(tutorID, status);
        return mapToSlotResponses(slots);
    }

    /**
     * Lấy slots đã được book của tutor
     */
    public List<BookingPlanSlotResponse> getBookedSlots(Long tutorID) {
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findBookedSlotsByTutorID(tutorID);
        return mapToSlotResponses(slots);
    }

    /**
     * Lấy slots còn trống (chưa được book) của tutor
     */
    public List<BookingPlanSlotResponse> getAvailableSlots(Long tutorID) {
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAvailableSlotsByTutorID(tutorID);
        return mapToSlotResponses(slots);
    }

    /**
     * Lấy slots của tutor trong khoảng thời gian
     */
    public List<BookingPlanSlotResponse> getSlotsByDateRange(Long tutorID, LocalDateTime startDate, LocalDateTime endDate) {
        tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository
                .findByTutorIDAndDateRange(tutorID, startDate, endDate);
        return mapToSlotResponses(slots);
    }

    /**
     * Map từ BookingPlanSlot sang BookingPlanSlotResponse
     */
    private List<BookingPlanSlotResponse> mapToSlotResponses(List<BookingPlanSlot> slots) {
        return slots.stream()
                .map(slot -> {
                    String learnerName = null;
                    if (slot.getUserID() != null) {
                        User user = userRepository.findById(slot.getUserID()).orElse(null);
                        learnerName = user != null ? user.getFullName() : null;
                    }

                    return BookingPlanSlotResponse.builder()
                            .slotID(slot.getSlotID())
                            .bookingPlanID(slot.getBookingPlanID())
                            .tutorID(slot.getTutorID())
                            .userID(slot.getUserID())
                            .startTime(slot.getStartTime())
                            .endTime(slot.getEndTime())
                            .paymentID(slot.getPaymentID())
                            .status(slot.getStatus())
                            .lockedAt(slot.getLockedAt())
                            .expiresAt(slot.getExpiresAt())
                            .learnerName(learnerName)
                            .build();
                })
                .toList();
    }
}

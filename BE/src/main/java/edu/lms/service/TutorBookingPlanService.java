package edu.lms.service;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.*;
import edu.lms.entity.BookingPlan;
import edu.lms.entity.BookingPlanSlot;
import edu.lms.entity.Tutor;
import edu.lms.enums.SlotStatus;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.BookingPlanRepository;
import edu.lms.repository.BookingPlanSlotRepository;
import edu.lms.repository.TutorRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
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

    public BookingPlanCreateResponse createBookingPlan(Long currentUserId, TutorBookingPlanRequest request) {
        Tutor tutor = getApprovedTutorByUserId(currentUserId);
        validatePlanRequest(request);
        ensureNoOverlappingPlans(tutor.getTutorID(), request.getTitle(), request.getStartTime(), request.getEndTime(), null);

        BookingPlan bookingPlan = BookingPlan.builder()
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .slotDuration(request.getSlotDuration())
                .pricePerHours(request.getPricePerHours().doubleValue())
                .tutorID(tutor.getTutorID())
                .isActive(true)
                .isOpen(true)
                .build();

        bookingPlan = bookingPlanRepository.save(bookingPlan);
        LocalDate targetDate = findTargetDateFromTitle(bookingPlan.getTitle());
        int slotsCreated = regenerateSlots(bookingPlan, targetDate);

        return BookingPlanCreateResponse.builder()
                .success(true)
                .bookingPlanId(bookingPlan.getBookingPlanID())
                .slotsCreated(slotsCreated)
                .build();
    }

    public BookingPlanUpdateResponse updateBookingPlan(Long currentUserId, Long bookingPlanId, TutorBookingPlanRequest request) {
        Tutor tutor = getApprovedTutorByUserId(currentUserId);
        BookingPlan bookingPlan = bookingPlanRepository.findById(bookingPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        ensurePlanOwner(tutor, bookingPlan);
        ensurePlanNotBooked(bookingPlanId);
        validatePlanRequest(request);
        ensureNoOverlappingPlans(tutor.getTutorID(), request.getTitle(), request.getStartTime(), request.getEndTime(), bookingPlanId);

        boolean timeFieldsChanged = hasTimeFieldsChanged(bookingPlan, request);

        bookingPlan.setTitle(request.getTitle());
        bookingPlan.setStartTime(request.getStartTime());
        bookingPlan.setEndTime(request.getEndTime());
        bookingPlan.setSlotDuration(request.getSlotDuration());
        bookingPlan.setPricePerHours(request.getPricePerHours().doubleValue());

        bookingPlanRepository.save(bookingPlan);

        int updatedSlots;
        if (timeFieldsChanged) {
            bookingPlanSlotRepository.deleteByBookingPlanID(bookingPlanId);
            LocalDate targetDate = findTargetDateFromTitle(bookingPlan.getTitle());
            updatedSlots = regenerateSlots(bookingPlan, targetDate);
        } else {
            updatedSlots = (int) bookingPlanSlotRepository.countByBookingPlanID(bookingPlanId);
        }

        return BookingPlanUpdateResponse.builder()
                .success(true)
                .updatedSlots(updatedSlots)
                .build();
    }

    public OperationStatusResponse deleteBookingPlan(Long currentUserId, Long bookingPlanId) {
        Tutor tutor = getApprovedTutorByUserId(currentUserId);
        BookingPlan bookingPlan = bookingPlanRepository.findById(bookingPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        ensurePlanOwner(tutor, bookingPlan);
        ensurePlanNotBooked(bookingPlanId);

        bookingPlanSlotRepository.deleteByBookingPlanID(bookingPlanId);
        bookingPlanRepository.delete(bookingPlan);

        return OperationStatusResponse.success("Booking plan deleted.");
    }

    @Transactional(readOnly = true)
    public BookingPlanListResponse getBookingPlansByTutor(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        List<TutorBookingPlanResponse> planResponses = bookingPlanRepository
                .findByTutorIDAndIsActiveTrueOrderByTitleAscStartTimeAsc(tutor.getTutorID())
                .stream()
                .map(this::toBookingPlanResponse)
                .toList();

        return BookingPlanListResponse.builder()
                .tutorId(tutor.getTutorID())
                .plans(planResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public BookingPlanDetailResponse getBookingPlanDetail(Long bookingPlanId) {
        BookingPlan bookingPlan = bookingPlanRepository.findById(bookingPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findByBookingPlanIDOrderByStartTimeAsc(bookingPlanId);

        List<BookingPlanSlotSummaryResponse> slotResponses = slots.stream()
                .map(this::toSlotSummary)
                .toList();

        return BookingPlanDetailResponse.builder()
                .bookingPlan(toBookingPlanResponse(bookingPlan))
                .slots(slotResponses)
                .build();
    }

    private BookingPlanSlotSummaryResponse toSlotSummary(BookingPlanSlot slot) {
        return BookingPlanSlotSummaryResponse.builder()
                .slotId(slot.getSlotID())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .status(slot.getUserID() == null ? "available" : "booked")
                        .build();
    }

    private void validatePlanRequest(TutorBookingPlanRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        long totalMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (totalMinutes < request.getSlotDuration()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private void ensureNoOverlappingPlans(Long tutorId, String title, LocalTime startTime, LocalTime endTime, Long excludeId) {
        List<BookingPlan> overlappingPlans = bookingPlanRepository.findOverlappingPlans(
                tutorId, title, startTime, endTime, excludeId);
        if (!overlappingPlans.isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_TIME_CONFLICT);
        }
    }

    private Tutor getApprovedTutorByUserId(Long currentUserId) {
        Tutor tutor = tutorRepository.findByUser_UserID(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        if (tutor.getStatus() == TutorStatus.SUSPENDED) {
            throw new AppException(ErrorCode.TUTOR_ACCOUNT_LOCKED);
        }

        if (tutor.getStatus() != TutorStatus.APPROVED) {
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);
        }

        return tutor;
    }

    private void ensurePlanOwner(Tutor tutor, BookingPlan bookingPlan) {
        if (!bookingPlan.getTutorID().equals(tutor.getTutorID())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void ensurePlanNotBooked(Long bookingPlanId) {
        if (bookingPlanSlotRepository.existsByBookingPlanIDAndUserIDIsNotNull(bookingPlanId)) {
            throw new AppException(ErrorCode.BOOKING_PLAN_HAS_BOOKED_SLOT);
        }
    }

    private boolean hasTimeFieldsChanged(BookingPlan bookingPlan, TutorBookingPlanRequest request) {
        return !bookingPlan.getTitle().equals(request.getTitle())
                || !bookingPlan.getStartTime().equals(request.getStartTime())
                || !bookingPlan.getEndTime().equals(request.getEndTime())
                || !bookingPlan.getSlotDuration().equals(request.getSlotDuration());
    }

    private int regenerateSlots(BookingPlan bookingPlan, LocalDate targetDate) {
        List<BookingPlanSlot> slots = new ArrayList<>();
        LocalDateTime slotStart = LocalDateTime.of(targetDate, bookingPlan.getStartTime());
        LocalDateTime planEnd = LocalDateTime.of(targetDate, bookingPlan.getEndTime());

        while (!slotStart.plusMinutes(bookingPlan.getSlotDuration()).isAfter(planEnd)) {
            LocalDateTime slotEnd = slotStart.plusMinutes(bookingPlan.getSlotDuration());

            BookingPlanSlot slot = BookingPlanSlot.builder()
                    .bookingPlanID(bookingPlan.getBookingPlanID())
                    .tutorID(bookingPlan.getTutorID())
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .status(SlotStatus.Available)
                    .lockedAt(null)
                    .expiresAt(null)
                    .build();

            slots.add(slot);
            slotStart = slotEnd;
        }

        bookingPlanSlotRepository.saveAll(slots);
        return slots.size();
    }

    private TutorBookingPlanResponse toBookingPlanResponse(BookingPlan bookingPlan) {
        Double rawPrice = bookingPlan.getPricePerHours();

        return TutorBookingPlanResponse.builder()
                .bookingPlanId(bookingPlan.getBookingPlanID())
                .tutorId(bookingPlan.getTutorID())
                .title(bookingPlan.getTitle())
                .startTime(bookingPlan.getStartTime())
                .endTime(bookingPlan.getEndTime())
                .slotDuration(bookingPlan.getSlotDuration())
                .pricePerHours(rawPrice == null ? BigDecimal.ZERO : BigDecimal.valueOf(rawPrice))
                .isOpen(bookingPlan.getIsOpen())
                .isActive(bookingPlan.getIsActive())
                .createdAt(bookingPlan.getCreatedAt())
                .updatedAt(bookingPlan.getUpdatedAt())
                            .build();
    }

    private LocalDate findTargetDateFromTitle(String title) {
        DayOfWeek dayOfWeek = parseTitleToDayOfWeek(title);
        LocalDate today = LocalDate.now();
        LocalDate targetDate = today.with(dayOfWeek);
        if (targetDate.isBefore(today)) {
            targetDate = targetDate.plusWeeks(1);
        }
        return targetDate;
    }

    private DayOfWeek parseTitleToDayOfWeek(String title) {
        return switch (title.trim().toUpperCase()) {
            case "T2" -> DayOfWeek.MONDAY;
            case "T3" -> DayOfWeek.TUESDAY;
            case "T4" -> DayOfWeek.WEDNESDAY;
            case "T5" -> DayOfWeek.THURSDAY;
            case "T6" -> DayOfWeek.FRIDAY;
            case "T7" -> DayOfWeek.SATURDAY;
            case "CN", "CHUNHAT", "CHỦ NHẬT" -> DayOfWeek.SUNDAY;
            default -> throw new AppException(ErrorCode.INVALID_KEY);
        };
    }
}

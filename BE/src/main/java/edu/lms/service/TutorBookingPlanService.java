package edu.lms.service;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.*;
import edu.lms.entity.*;
import edu.lms.enums.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TutorBookingPlanService {

    BookingPlanRepository bookingPlanRepository;
    BookingPlanSlotRepository bookingPlanSlotRepository;
    TutorRepository tutorRepository;
    RefundRequestRepository refundRequestRepository;
    NotificationRepository notificationRepository;
    PaymentRepository paymentRepository;
    PayOSService payOSService;

    // =========================================================
    // CREATE BOOKING PLAN
    // =========================================================
    public BookingPlanCreateResponse createBookingPlan(Long currentUserId, TutorBookingPlanRequest request) {
        Tutor tutor = getApprovedTutorByUserId(currentUserId);

        validatePlanRequest(request);
        ensureNoOverlappingPlans(
                tutor.getTutorID(),
                request.getTitle(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );

        BookingPlan bookingPlan = BookingPlan.builder()
                .title(request.getTitle())
                .startHours(request.getStartTime())
                .endHours(request.getEndTime())
                .slotDuration(request.getSlotDuration())
                .pricePerHours(request.getPricePerHours().doubleValue())
                .tutorID(tutor.getTutorID())
                .isActive(true)
                .isOpen(true)
                .build();

        bookingPlan = bookingPlanRepository.save(bookingPlan);

        long totalMinutes = Duration.between(
                bookingPlan.getStartHours(),
                bookingPlan.getEndHours()
        ).toMinutes();
        int possibleSlots = (int) (totalMinutes / bookingPlan.getSlotDuration());

        return BookingPlanCreateResponse.builder()
                .success(true)
                .bookingPlanId(bookingPlan.getBookingPlanID())
                .slotsCreated(possibleSlots)
                .build();
    }

    // =========================================================
    // UPDATE BOOKING PLAN
    // =========================================================
    public BookingPlanUpdateResponse updateBookingPlan(Long currentUserId, Long bookingPlanId, TutorBookingPlanRequest request) {
        Tutor tutor = getApprovedTutorByUserId(currentUserId);
        BookingPlan bookingPlan = bookingPlanRepository.findById(bookingPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        ensurePlanOwner(tutor, bookingPlan);
        validatePlanRequest(request);
        ensureNoOverlappingPlans(
                tutor.getTutorID(),
                request.getTitle(),
                request.getStartTime(),
                request.getEndTime(),
                bookingPlanId
        );

        boolean timeFieldsChanged = hasTimeFieldsChanged(bookingPlan, request);

        bookingPlan.setTitle(request.getTitle());
        bookingPlan.setStartHours(request.getStartTime());
        bookingPlan.setEndHours(request.getEndTime());
        bookingPlan.setSlotDuration(request.getSlotDuration());
        bookingPlan.setPricePerHours(request.getPricePerHours().doubleValue());

        bookingPlanRepository.save(bookingPlan);

        int affectedSlots = 0;
        if (timeFieldsChanged) {
            affectedSlots = adjustSlotsForNewPlan(bookingPlan);
        }

        return BookingPlanUpdateResponse.builder()
                .success(true)
                .updatedSlots(affectedSlots)
                .build();
    }

    // =========================================================
    // DELETE BOOKING PLAN
    // =========================================================
    public OperationStatusResponse deleteBookingPlan(Long currentUserId, Long bookingPlanId) {
        Tutor tutor = getApprovedTutorByUserId(currentUserId);
        BookingPlan bookingPlan = bookingPlanRepository.findById(bookingPlanId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_PLAN_NOT_FOUND));

        ensurePlanOwner(tutor, bookingPlan);

        boolean hasAnySlot = bookingPlanSlotRepository.existsByBookingPlanID(bookingPlanId);
        if (hasAnySlot) {
            throw new AppException(ErrorCode.BOOKING_PLAN_HAS_BOOKED_SLOT);
        }

        bookingPlanRepository.delete(bookingPlan);
        return OperationStatusResponse.success("Booking plan deleted.");
    }

    // =========================================================
    // QUERY
    // =========================================================
    @Transactional(readOnly = true)
    public BookingPlanListResponse getBookingPlansByTutor(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        List<TutorBookingPlanResponse> planResponses = bookingPlanRepository
                .findByTutorIDAndIsActiveTrueOrderByTitleAscStartHoursAsc(tutor.getTutorID())
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

        List<BookingPlanSlot> slots = bookingPlanSlotRepository
                .findByBookingPlanIDOrderByStartTimeAsc(bookingPlanId);

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
                .status(slot.getStatus().name())
                .build();
    }

    // =========================================================
    // VALIDATION
    // =========================================================
    private void validatePlanRequest(TutorBookingPlanRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        long totalMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (totalMinutes < request.getSlotDuration()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
    }

    private void ensureNoOverlappingPlans(
            Long tutorId,
            String title,
            LocalTime startTime,
            LocalTime endTime,
            Long excludeId
    ) {
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

    private boolean hasTimeFieldsChanged(BookingPlan bookingPlan, TutorBookingPlanRequest request) {
        return !bookingPlan.getStartHours().equals(request.getStartTime())
                || !bookingPlan.getEndHours().equals(request.getEndTime())
                || !bookingPlan.getSlotDuration().equals(request.getSlotDuration())
                || !bookingPlan.getTitle().equals(request.getTitle());
    }

    // =========================================================
    // LOGIC UPDATE PLAN → HANDLE LOST SLOTS
    // =========================================================
    private int adjustSlotsForNewPlan(BookingPlan plan) {
        List<BookingPlanSlot> existingSlots = bookingPlanSlotRepository
                .findByBookingPlanIDOrderByStartTimeAsc(plan.getBookingPlanID());

        int affected = 0;

        for (BookingPlanSlot slot : existingSlots) {
            if (slot.getStatus() == SlotStatus.Rejected) continue;
            if (!isSlotInsideNewPlan(slot, plan)) {
                handleLostSlot(slot, plan);
                affected++;
            }
        }

        return affected;
    }

    private boolean isSlotInsideNewPlan(BookingPlanSlot slot, BookingPlan plan) {
        LocalTime s = slot.getStartTime().toLocalTime();
        LocalTime e = slot.getEndTime().toLocalTime();
        return !s.isBefore(plan.getStartHours()) && !e.isAfter(plan.getEndHours());
    }

    // =========================================================
    // HANDLE LOST SLOT (CANCEL PAYMENT, REFUND, NOTIFY)
    // =========================================================
    private void handleLostSlot(BookingPlanSlot slot, BookingPlan plan) {
        Long userId = slot.getUserID();

        // ===== CASE 1: Slot chưa có người đặt =====
        if (userId == null) {
            slot.setStatus(SlotStatus.Rejected);
            slot.setLockedAt(null);
            slot.setExpiresAt(null);
            slot.setPaymentID(null);
            bookingPlanSlotRepository.save(slot);
            return;
        }

        // ===== CASE 2: Slot đang LOCKED (learner đang thanh toán) =====
        if (slot.getStatus() == SlotStatus.Locked) {

            // Huỷ payment link nếu có
            if (slot.getPaymentID() != null) {
                Payment payment = paymentRepository.findById(slot.getPaymentID()).orElse(null);

                if (payment != null && payment.getPaymentLinkId() != null) {
                    try {
                        payOSService.cancelPaymentLink(payment.getPaymentLinkId());

                        payment.setStatus(PaymentStatus.CANCELLED);
                        payment.setIsPaid(false);
                        payment.setPaidAt(null);
                        payment.setExpiresAt(LocalDateTime.now());
                        paymentRepository.save(payment);

                        log.info("Payment {} cancelled due to slot rejection", payment.getPaymentID());
                    } catch (Exception e) {
                        log.error("Cannot cancel payment link {}", payment.getPaymentLinkId(), e);
                    }
                }
            }

            // 3. Reject slot + clear lock
            slot.setStatus(SlotStatus.Rejected);
            slot.setLockedAt(null);
            slot.setExpiresAt(null);
            // slot.setPaymentID(null); // giữ lại để webhook còn biết slot thuộc payment này
            bookingPlanSlotRepository.save(slot);

            // 4. Notify learner
            sendNotification(
                    userId,
                    " Có buổi học mà đang thanh toán đã bị huỷ",
                    "Có buổi học học mà bạn đang tanh toán"
                            + " đã bị hủy do tutor thay đổi lịch. "
                            + "Link thanh toán đã bị vô hiệu hoá, bạn sẽ không bị trừ tiền.",
                    NotificationType.TUTOR_CANCEL_BOOKING,
                    "/learner/booking"
            );
            return;
        }

        // ===== CASE 3: Slot đã PAID → tạo Refund =====
        if (slot.getStatus() == SlotStatus.Paid) {

            slot.setStatus(SlotStatus.Rejected);
            bookingPlanSlotRepository.save(slot);

            BigDecimal refundAmount = calculateRefundAmount(slot, plan);

            RefundRequest refund = RefundRequest.builder()
                    .bookingPlanId(plan.getBookingPlanID())
                    .slotId(slot.getSlotID())
                    .userId(userId)
                    .packageId(slot.getUserPackage() != null ? slot.getUserPackage().getUserPackageID() : null)
                    .refundAmount(refundAmount)
                    .status(RefundStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .build();

            refundRequestRepository.save(refund);

            sendNotification(
                    userId,
                    "Yêu cầu hoàn tiền được tạo",
                    "Buổi học vào lúc " + formatDateTime(slot.getStartTime()) +
                            " đã bị huỷ. Hệ thống đã tạo yêu cầu hoàn tiền. "
                            + "Vui lòng nhập thông tin ngân hàng để nhận tiền.",
                    NotificationType.REFUND_AVAILABLE,
                    "/learner/refunds"
            );
        }
    }

    private BigDecimal calculateRefundAmount(BookingPlanSlot slot, BookingPlan plan) {
        BigDecimal pricePerHour = BigDecimal.valueOf(plan.getPricePerHours());
        long minutes = Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();

        if (minutes <= 0) return BigDecimal.ZERO;

        return pricePerHour
                .multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, BigDecimal.ROUND_HALF_UP);
    }

    private void sendNotification(
            Long userId,
            String title,
            String content,
            NotificationType type,
            String primaryUrl
    ) {
        Notification n = Notification.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .type(type)
                .primaryActionUrl(primaryUrl)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(n);
    }

    private String formatDateTime(LocalDateTime dt) {
        return dt.toLocalTime() + " ngày " + dt.toLocalDate();
    }

    private TutorBookingPlanResponse toBookingPlanResponse(BookingPlan bookingPlan) {
        Double rawPrice = bookingPlan.getPricePerHours();

        return TutorBookingPlanResponse.builder()
                .bookingPlanId(bookingPlan.getBookingPlanID())
                .tutorId(bookingPlan.getTutorID())
                .title(bookingPlan.getTitle())
                .startTime(bookingPlan.getStartHours())
                .endTime(bookingPlan.getEndHours())
                .slotDuration(bookingPlan.getSlotDuration())
                .pricePerHours(rawPrice == null ? BigDecimal.ZERO : BigDecimal.valueOf(rawPrice))
                .isOpen(bookingPlan.getIsOpen())
                .isActive(bookingPlan.getIsActive())
                .createdAt(bookingPlan.getCreatedAt())
                .updatedAt(bookingPlan.getUpdatedAt())
                .build();
    }

}

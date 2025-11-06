package edu.lms.service;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.dto.request.SlotRequest;
import edu.lms.entity.*;
import edu.lms.enums.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CourseRepository courseRepository;
    private final BookingPlanRepository bookingPlanRepository;
    private final BookingPlanSlotRepository bookingPlanSlotRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PayOSService payOSService;
    private final ChatService chatService;

    // ======================================================
    //TẠO THANH TOÁN (PENDING)
    // ======================================================
    @Transactional
    public ResponseEntity<?> createPayment(PaymentRequest request) {
        BigDecimal amount;
        String description;

        // ======================================================
        // COURSE PAYMENT
        // ======================================================
        if (request.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            amount = course.getPrice();
            description = "Thanh toán khóa học: " + course.getTitle();

            Payment payment = Payment.builder()
                    .userId(request.getUserId())
                    .targetId(course.getCourseID())
                    .paymentType(PaymentType.Course)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .amount(amount)
                    .isPaid(false)
                    .build();

            paymentRepository.save(payment);

            // Gọi PayOS để tạo link QR (hết hạn sau 15p)
            ResponseEntity<?> response = payOSService.createPaymentLink(
                    request.getUserId(),
                    request.getPaymentType(),
                    request.getTargetId(),
                    amount,
                    description
            );

            updatePaymentWithPayOSResponse(payment, response);
            return response;
        }

        // ======================================================
        // BOOKING PLAN PAYMENT (1:1 SLOT SYSTEM)
        // ======================================================
        else if (request.getPaymentType() == PaymentType.Booking) {
            BookingPlan plan = bookingPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

            List<SlotRequest> slots = request.getSlots();
            if (slots == null || slots.isEmpty()) {
                throw new AppException(ErrorCode.BOOKING_SLOT_NOT_AVAILABLE);
            }

            // ====== 💰 TÍNH TỔNG TIỀN ======
            BigDecimal pricePerHour = BigDecimal.valueOf(plan.getPricePerHours());
            BigDecimal totalAmount = pricePerHour.multiply(BigDecimal.valueOf(slots.size()));

            description = "Thanh toán " + slots.size() + " slot học 1:1 cho " + plan.getTitle();

            // ====== 🕒 TẠO SLOT (LOCKED 15 PHÚT) ======
            for (SlotRequest s : slots) {
                LocalDateTime start = s.getStartTime();
                LocalDateTime end = s.getEndTime();

                boolean isTaken = bookingPlanSlotRepository.existsByTutorIDAndStartTimeAndEndTime(
                        plan.getTutorID(), start, end);
                if (isTaken) {
                    throw new AppException(ErrorCode.BOOKING_SLOT_NOT_AVAILABLE);
                }

                BookingPlanSlot slot = BookingPlanSlot.builder()
                        .bookingPlanID(plan.getBookingPlanID())
                        .tutorID(plan.getTutorID())
                        .userID(request.getUserId())
                        .startTime(start)
                        .endTime(end)
                        .status(SlotStatus.Locked)
                        .lockedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusMinutes(15)) // giữ 15p
                        .build();

                bookingPlanSlotRepository.save(slot);
            }

            // ====== TẠO PAYMENT PENDING ======
            Payment payment = Payment.builder()
                    .userId(user.getUserID())
                    .targetId(plan.getBookingPlanID())
                    .paymentType(PaymentType.Booking)
                    .paymentMethod(PaymentMethod.PAYOS)
                    .status(PaymentStatus.PENDING)
                    .amount(totalAmount)
                    .isPaid(false)
                    .build();

            paymentRepository.save(payment);

            // Gán PaymentID cho tất cả slot Locked
            bookingPlanSlotRepository.updatePaymentForUserLockedSlots(
                    user.getUserID(),
                    plan.getTutorID(),
                    payment.getPaymentID()
            );

            // ====== 🔗 GỌI PAYOS TẠO QR CODE (15p) ======
            ResponseEntity<?> response = payOSService.createPaymentLink(
                    request.getUserId(),
                    request.getPaymentType(),
                    request.getTargetId(),
                    totalAmount,
                    description
            );

            updatePaymentWithPayOSResponse(payment, response);
            return response;
        }

        else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_TYPE);
        }
    }

    // ======================================================
    //HẬU THANH TOÁN (PAYMENT SUCCESS)
    // ======================================================
    @Transactional
    public void processPostPayment(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PAID) return;

        payment.setIsPaid(true);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Long userId = payment.getUserId();
        Long targetId = payment.getTargetId();

        // -------- COURSE PAYMENT --------
        if (payment.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(targetId)
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXIST));

            Enrollment enrollment = Enrollment.builder()
                    .user(user)
                    .course(course)
                    .status(EnrollmentStatus.Active)
                    .createdAt(LocalDateTime.now())
                    .build();

            enrollmentRepository.save(enrollment);
            payment.setEnrollment(enrollment);
            paymentRepository.save(payment);

            log.info("[COURSE PAYMENT] User {} enrolled in course '{}'", user.getUserID(), course.getTitle());
        }

        // -------- BOOKING PLAN PAYMENT --------
        else if (payment.getPaymentType() == PaymentType.Booking) {
            // Lấy tất cả slot của payment này và update sang PAID
            List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAllByPaymentID(payment.getPaymentID());
            for (BookingPlanSlot s : slots) {
                s.setStatus(SlotStatus.Paid);
                bookingPlanSlotRepository.save(s);
            }

            log.info("[BOOKING PLAN PAID] User {} confirmed {} slots as PAID", userId, slots.size());
            
            // Auto-create Training chat room nếu chưa có
            // Lấy tutorID từ slot đầu tiên (tất cả slots trong cùng payment đều cùng tutor)
            if (!slots.isEmpty()) {
                Long tutorID = slots.get(0).getTutorID();
                try {
                    chatService.ensureTrainingRoomExists(userId, tutorID);
                    log.info("[CHAT ROOM] Training room ensured for User {} and Tutor {}", userId, tutorID);
                } catch (Exception e) {
                    log.warn("[CHAT ROOM] Failed to ensure Training room: {}", e.getMessage());
                    // Không throw exception để không ảnh hưởng đến payment flow
                }
            }
        }
    }

    // ======================================================
    //ROLLBACK (FAILED / EXPIRED)
    // ======================================================
    @Transactional
    public void rollbackBookingPayment(Payment payment) {
        if (payment.getPaymentType() != PaymentType.Booking) return;

        List<BookingPlanSlot> slots = bookingPlanSlotRepository.findAllByPaymentID(payment.getPaymentID());
        for (BookingPlanSlot s : slots) {
            if (s.getStatus() == SlotStatus.Locked) {
                bookingPlanSlotRepository.delete(s);
            }
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setIsPaid(false);
        paymentRepository.save(payment);

        log.warn("[ROLLBACK] Payment {} cancelled, deleted {} locked slots", payment.getOrderCode(), slots.size());
    }

    // ======================================================
    // CẬP NHẬT PAYMENT SAU KHI NHẬN LINK PAYOS
    // ======================================================
    @SuppressWarnings("unchecked")
    private void updatePaymentWithPayOSResponse(Payment payment, ResponseEntity<?> response) {
        try {
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody != null) {
                String orderCode = (String) responseBody.get("orderCode");
                Map<String, Object> data = (Map<String, Object>) responseBody.get("data");

                payment.setOrderCode(orderCode);
                payment.setCheckoutUrl((String) data.get("checkoutUrl"));
                payment.setQrCodeUrl((String) data.get("qrCode"));
                payment.setPaymentLinkId((String) data.get("paymentLinkId"));

                paymentRepository.save(payment);
                log.info("[PAYMENT UPDATED] Payment {} updated with PayOS link data", payment.getPaymentID());
            }
        } catch (Exception e) {
            log.error("Failed to update payment info from PayOS response: {}", e.getMessage());
        }
    }
}

package edu.lms.service;

import edu.lms.dto.request.PaymentRequest;
import edu.lms.entity.*;
import edu.lms.enums.PaymentType;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CourseRepository courseRepository;
    private final UserBookingPlanRepository userBookingPlanRepository;
    private final PayOSService payOSService;

    public ResponseEntity<?> createPayment(PaymentRequest request) {
        BigDecimal amount;
        String description;

        //Xác định loại thanh toán
        if (request.getPaymentType() == PaymentType.Course) {
            Course course = courseRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

            amount = course.getPrice();
            description = "Thanh toán khóa học: " + course.getTitle();

        } else if (request.getPaymentType() == PaymentType.Booking) {
            UserBookingPlan userBookingPlan = userBookingPlanRepository.findById(request.getTargetId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

            BookingPlan bookingPlan = userBookingPlan.getBookingPlan();

            // Tính tổng tiền = giá mỗi slot * số slot mua
            BigDecimal pricePerSlot = bookingPlan.getPricePerSlot();
            int slotsPurchased = userBookingPlan.getPurchasedSlots();
            amount = pricePerSlot.multiply(BigDecimal.valueOf(slotsPurchased));

            description = String.format(
                    "Thanh toán gói học: %s (%d slot x %s VND/slot)",
                    bookingPlan.getTitle(),
                    slotsPurchased,
                    pricePerSlot.toPlainString()
            );
        }
        else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_TYPE);
        }

        //Gọi PayOS để tạo link thanh toán
        return payOSService.createPaymentLink(
                request.getUserId(),
                request.getPaymentType(),
                request.getTargetId(),
                amount,
                description
        );
    }
}

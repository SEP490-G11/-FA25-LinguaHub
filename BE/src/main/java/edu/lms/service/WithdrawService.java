package edu.lms.service;

import edu.lms.dto.request.WithdrawRequest;
import edu.lms.dto.response.WithdrawResponse;
import edu.lms.entity.Payment;
import edu.lms.entity.Setting;
import edu.lms.entity.Tutor;
import edu.lms.entity.WithdrawMoney;
import edu.lms.enums.PaymentType;
import edu.lms.enums.WithdrawStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.PaymentRepository;
import edu.lms.repository.SettingRepository;
import edu.lms.repository.TutorRepository;
import edu.lms.repository.WithdrawRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class WithdrawService {

    WithdrawRepository withdrawRepository;
    TutorRepository tutorRepository;
    PaymentRepository paymentRepository;
    SettingRepository settingRepository;

    // =============================
    // CALCULATE REALTIME BALANCE
    // =============================
    private BigDecimal calculateNetIncome(Long tutorId) {

        // Lấy commission
        Setting setting = settingRepository.getCurrentSetting();
        BigDecimal commissionCourse = setting.getCommissionCourse();
        BigDecimal commissionBooking = setting.getCommissionBooking();

        // Lấy tất cả payment PAID
        List<Payment> payments = paymentRepository.findSuccessPaymentsByTutor(tutorId);

        BigDecimal totalNet = BigDecimal.ZERO;

        for (Payment p : payments) {
            BigDecimal net;

            if (p.getPaymentType() == PaymentType.Course) {
                net = p.getAmount()
                        .subtract(p.getAmount().multiply(commissionCourse));
            } else {
                net = p.getAmount()
                        .subtract(p.getAmount().multiply(commissionBooking));
            }

            totalNet = totalNet.add(net);
        }

        return totalNet;
    }


    // =============================
    // TUTOR REQUEST WITHDRAW
    // =============================
    public WithdrawResponse createWithdraw(Long tutorId, WithdrawRequest req) {

        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        // Tính tổng số tiền NET hiện tại
        BigDecimal totalNet = calculateNetIncome(tutorId);

        BigDecimal withdrawAmount = req.getWithdrawAmount();

        // Không cho rút quá số đang có
        if (withdrawAmount.compareTo(totalNet) > 0) {
            throw new AppException(ErrorCode.INVALID_AMOUNT);
        }

        // Tạo bản ghi Withdraw
        WithdrawMoney withdraw = WithdrawMoney.builder()
                .tutor(tutor)
                .totalAmount(totalNet)
                .withdrawAmount(withdrawAmount)
                .bankAccountNumber(req.getBankAccountNumber())
                .bankName(req.getBankName())
                .bankOwnerName(req.getBankOwnerName())
                .status(WithdrawStatus.PENDING)
                .build();

        withdrawRepository.save(withdraw);

        return toResponse(withdraw);
    }


    // =============================
    // GET BALANCE (REALTIME)
    // =============================
    public BigDecimal getBalance(Long tutorId) {
        tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        return calculateNetIncome(tutorId);
    }


    // =============================
    // HISTORY FOR TUTOR
    // =============================
    public List<WithdrawResponse> getWithdrawHistory(Long tutorId) {
        return withdrawRepository.findByTutorTutorID(tutorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =============================
    // MAPPER
    // =============================
    private WithdrawResponse toResponse(WithdrawMoney w) {
        return WithdrawResponse.builder()
                .withdrawId(w.getWithdrawId())
                .tutorId(w.getTutor().getTutorID())
                .totalAmount(w.getTotalAmount())
                .withdrawAmount(w.getWithdrawAmount())
                .bankAccountNumber(w.getBankAccountNumber())
                .bankName(w.getBankName())
                .bankOwnerName(w.getBankOwnerName())
                .status(w.getStatus())
                .createdAt(w.getCreatedAt())
                .build();
    }

}

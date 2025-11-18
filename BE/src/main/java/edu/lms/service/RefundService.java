package edu.lms.service;

import edu.lms.dto.request.RefundInfoRequest;
import edu.lms.entity.RefundRequest;
import edu.lms.enums.RefundStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.RefundRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class RefundService {

    private final RefundRequestRepository refundRepo;

    public void submitRefundInfo(Long refundId, RefundInfoRequest dto, Long userId) {
        RefundRequest req = refundRepo.findById(refundId)
                .orElseThrow(() -> new AppException(ErrorCode.REFUND_NOT_FOUND));

        if (!req.getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        req.setBankName(dto.getBankName());
        req.setBankOwnerName(dto.getBankOwnerName());
        req.setBankAccountNumber(dto.getBankAccountNumber());
        req.setStatus(RefundStatus.SUBMITTED);

        refundRepo.save(req);
    }

    public void approve(Long refundId) {
        RefundRequest req = refundRepo.findById(refundId)
                .orElseThrow(() -> new AppException(ErrorCode.REFUND_NOT_FOUND));

        req.setStatus(RefundStatus.APPROVED);
        req.setProcessedAt(LocalDateTime.now());

        refundRepo.save(req);
    }

    public void reject(Long refundId) {
        RefundRequest req = refundRepo.findById(refundId)
                .orElseThrow(() -> new AppException(ErrorCode.REFUND_NOT_FOUND));

        req.setStatus(RefundStatus.REJECTED);
        req.setProcessedAt(LocalDateTime.now());

        refundRepo.save(req);
    }
}

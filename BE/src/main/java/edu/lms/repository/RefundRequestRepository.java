package edu.lms.repository;

import edu.lms.entity.RefundRequest;
import edu.lms.enums.RefundStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {

    List<RefundRequest> findByUserId(Long userId);
    List<RefundRequest> findByStatus(RefundStatus status);
}

package edu.lms.repository;

import edu.lms.entity.Payment;
import edu.lms.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderCode(String orderCode);

    List<Payment> findAllByTutorId(Long tutorId);

    List<Payment> findAllByUserId(Long userId);

    List<Payment> findAllByStatusAndExpiresAtBefore(PaymentStatus status, LocalDateTime now);


    @Query("""
        SELECT p FROM Payment p
        WHERE p.tutorId = :tutorId
          AND p.status = edu.lms.enums.PaymentStatus.PAID
    """)
    List<Payment> findSuccessPaymentsByTutor(Long tutorId);
}

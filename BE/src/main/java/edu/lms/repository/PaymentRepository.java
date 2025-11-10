package edu.lms.repository;

import edu.lms.entity.Payment;
import edu.lms.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderCode(String orderCode);

    List<Payment> findAllByTutorId(Long tutorId);

    List<Payment> findAllByUserId(Long userId);


}

package edu.lms.repository;

import edu.lms.entity.TutorVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TutorVerificationRepository extends JpaRepository<TutorVerification, Long> {

    // Lấy danh sách verification theo TutorID
    List<TutorVerification> findByTutor_TutorId(Long tutorId);

    // Lấy tất cả yêu cầu theo trạng thái (Pending, Approved, Rejected)
    List<TutorVerification> findByStatus(TutorVerification.Status status);
}

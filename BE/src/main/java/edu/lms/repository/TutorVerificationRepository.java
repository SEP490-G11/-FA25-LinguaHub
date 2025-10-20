package edu.lms.repository;

import edu.lms.entity.TutorVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface TutorVerificationRepository extends JpaRepository<TutorVerification, Long> {

    List<TutorVerification> findByTutor_TutorId(Long tutorId);

    List<TutorVerification> findByStatus(TutorVerification.Status status);

    // Lấy bản Pending mới nhất cho 1 Tutor (phục vụ approve/reject theo tutorId)
    Optional<TutorVerification> findFirstByTutor_TutorIdAndStatusOrderByTutorVerificationIdDesc(
            Long tutorId, TutorVerification.Status status);
}

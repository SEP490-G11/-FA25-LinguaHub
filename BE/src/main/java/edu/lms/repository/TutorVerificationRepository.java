package edu.lms.repository;
import edu.lms.entity.Tutor;
import edu.lms.entity.TutorVerification;
import edu.lms.enums.TutorVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TutorVerificationRepository extends JpaRepository<TutorVerification, Long> {

    // Tìm lần apply gần nhất của một Tutor
    Optional<TutorVerification> findTopByTutorOrderBySubmittedAtDesc(Tutor tutor);

    // Lấy danh sách tất cả các đơn cho 1 tutor (lịch sử)
    List<TutorVerification> findAllByTutorOrderBySubmittedAtDesc(Tutor tutor);

    // Kiểm tra tutor có đơn nào đang pending chưa
    boolean existsByTutorAndStatus(Tutor tutor, TutorVerificationStatus status);

    // Lấy tất cả hồ sơ có trạng thái pending (cho Admin review)
    List<TutorVerification> findAllByStatusOrderBySubmittedAtAsc(TutorVerificationStatus status);

    // Lấy tất cả hồ sơ có trạng thái trong danh sách status (PENDING, REJECTED, APPROVED)
    List<TutorVerification> findAllByStatusInOrderBySubmittedAtDesc(List<TutorVerificationStatus> statuses);
}

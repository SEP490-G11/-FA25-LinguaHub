package edu.lms.repository;

import edu.lms.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {

    // Tìm Tutor theo UserID (trường hợp cần lấy theo user)
    Optional<Tutor> findByUser_UserId(Long userId);

    // Kiểm tra một user đã là tutor chưa
    boolean existsByUser_UserId(Long userId);
}

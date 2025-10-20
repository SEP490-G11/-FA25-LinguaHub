package edu.lms.repository;

import edu.lms.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {

    Optional<Tutor> findByUser_UserId(Long userId);

    boolean existsByUser_UserId(Long userId);

    @Query("""
           SELECT t FROM Tutor t
           JOIN t.user u
           WHERE (:status IS NULL OR t.status = :status)
             AND (
               :keyword IS NULL
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
             )
           """)
    Page<Tutor> search(String keyword, Tutor.TutorStatus status, Pageable pageable);
}

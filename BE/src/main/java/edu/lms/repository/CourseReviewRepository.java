package edu.lms.repository;

import edu.lms.entity.CourseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {
    List<CourseReview> findByCourse_CourseID(Long courseId);
    Optional<CourseReview> findByCourse_CourseIDAndUser_UserID(Long courseId, Long userId);

}

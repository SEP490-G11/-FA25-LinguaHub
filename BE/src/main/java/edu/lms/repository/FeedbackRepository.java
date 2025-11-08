package edu.lms.repository;

import edu.lms.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // feedback -> payment -> enrollment -> course
    List<Feedback> findByPayment_Enrollment_Course_CourseID(Long courseId);
}

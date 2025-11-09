package edu.lms.repository;

import edu.lms.entity.Course;
import edu.lms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByCourse(Course course);

    @Query("""
        SELECT e FROM Enrollment e
        JOIN FETCH e.user u
        WHERE e.course.courseID = :courseId
    """)
    List<Enrollment> findAllByCourseId(Long courseId);

    List<Enrollment> findByUser_UserID(Long userId);
    Optional<Enrollment> findByUser_UserIDAndCourse_CourseID(Long userId, Long courseId);
    long countByCourse_CourseID(Long courseId);

}

package edu.lms.repository;

import edu.lms.entity.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseSectionRepository extends JpaRepository<CourseSection, Long> {
    @Query("SELECT cs FROM CourseSection cs LEFT JOIN FETCH cs.lessons WHERE cs.course.courseID = :courseID")
    List<CourseSection> findByCourse_CourseID(@Param("courseID") Long courseID);
    
    @Query("SELECT cs FROM CourseSection cs LEFT JOIN FETCH cs.lessons l LEFT JOIN FETCH l.resources WHERE cs.sectionID = :sectionId")
    Optional<CourseSection> findByIdWithLessons(@Param("sectionId") Long sectionId);
    
    @Query("SELECT cs FROM CourseSection cs WHERE cs.sectionID = :sectionId AND cs.course.tutor.tutorID = :tutorId")
    Optional<CourseSection> findBySectionIdAndTutorId(@Param("sectionId") Long sectionId, @Param("tutorId") Long tutorId);

}

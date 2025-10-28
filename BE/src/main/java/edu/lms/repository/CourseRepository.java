package edu.lms.repository;

import edu.lms.entity.Course;
import edu.lms.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTutor(Tutor tutor);
}

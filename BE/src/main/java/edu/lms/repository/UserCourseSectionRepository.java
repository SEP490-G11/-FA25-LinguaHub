package edu.lms.repository;

import edu.lms.entity.UserCourseSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCourseSectionRepository extends JpaRepository<UserCourseSection, Long> {
    Optional<UserCourseSection> findByUser_UserIDAndSection_SectionID(Long userId, Long sectionId);
}

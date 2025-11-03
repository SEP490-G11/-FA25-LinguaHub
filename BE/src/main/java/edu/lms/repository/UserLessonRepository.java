package edu.lms.repository;

import edu.lms.entity.UserLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserLessonRepository extends JpaRepository<UserLesson, Long> {
    Optional<UserLesson> findByUser_UserIDAndLesson_LessonID(Long userId, Long lessonId);
}

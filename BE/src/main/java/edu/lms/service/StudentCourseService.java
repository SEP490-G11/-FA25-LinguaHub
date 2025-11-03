package edu.lms.service;

import edu.lms.dto.response.LessonInSectionResponse;
import edu.lms.dto.response.SectionProgressResponse;
import edu.lms.dto.response.StudentCourseResponse;
import edu.lms.entity.Enrollment;
import edu.lms.entity.UserLesson;
import edu.lms.repository.EnrollmentRepository;
import edu.lms.repository.UserCourseSectionRepository;
import edu.lms.repository.UserLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserCourseSectionRepository userCourseSectionRepository;
    private final UserLessonRepository userLessonRepository;

    public List<StudentCourseResponse> getCoursesByStudent(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUser_UserID(userId);

        return enrollments.stream().map(enrollment -> {
            var course = enrollment.getCourse();
            var tutor = course.getTutor();
            var sections = course.getSections();

            if (sections == null || sections.isEmpty()) {
                return StudentCourseResponse.builder()
                        .courseID(course.getCourseID())
                        .courseTitle(course.getTitle())
                        .tutorName(tutor.getUser().getFullName())
                        .price(course.getPrice())
                        .language(course.getLanguage())
                        .thumbnailURL(course.getThumbnailURL())
                        .status(enrollment.getStatus().name())
                        .enrolledAt(enrollment.getCreatedAt())
                        .progressPercent(BigDecimal.ZERO)
                        .isCompleted(false)
                        .sectionProgress(List.of())
                        .build();
            }

            // Lấy progress cho từng section + lesson

            List<SectionProgressResponse> sectionProgressList = sections.stream().map(section -> {
                var ucs = userCourseSectionRepository
                        .findByUser_UserIDAndSection_SectionID(userId, section.getSectionID())
                        .orElse(null);
                BigDecimal sectionProgress = (ucs != null) ? ucs.getProgress() : BigDecimal.ZERO;
                boolean sectionDone = sectionProgress.compareTo(BigDecimal.valueOf(100)) >= 0;

                // Lấy list lesson
                List<LessonInSectionResponse> lessonList = section.getLessons().stream().map(lesson -> {
                    boolean isDone = userLessonRepository
                            .findByUser_UserIDAndLesson_LessonID(userId, lesson.getLessonID())
                            .map(UserLesson::getIsDone)
                            .orElse(false);
                    return LessonInSectionResponse.builder()
                            .lessonId(lesson.getLessonID())
                            .lessonTitle(lesson.getTitle())
                            .isDone(isDone)
                            .build();
                }).toList();

                return SectionProgressResponse.builder()
                        .sectionId(section.getSectionID())
                        .sectionTitle(section.getTitle())
                        .progress(sectionProgress)
                        .isCompleted(sectionDone)
                        .lessons(lessonList)
                        .build();
            }).toList();

            // Tính tổng progress khóa học
            double totalProgress = sectionProgressList.stream()
                    .mapToDouble(sp -> sp.getProgress().doubleValue())
                    .average()
                    .orElse(0.0);
            boolean completed = totalProgress >= 99.9;

            return StudentCourseResponse.builder()
                    .courseID(course.getCourseID())
                    .courseTitle(course.getTitle())
                    .tutorName(tutor.getUser().getFullName())
                    .price(course.getPrice())
                    .language(course.getLanguage())
                    .thumbnailURL(course.getThumbnailURL())
                    .status(enrollment.getStatus().name())
                    .enrolledAt(enrollment.getCreatedAt())
                    .progressPercent(BigDecimal.valueOf(totalProgress))
                    .isCompleted(completed)
                    .sectionProgress(sectionProgressList)
                    .build();
        }).toList();
    }
}




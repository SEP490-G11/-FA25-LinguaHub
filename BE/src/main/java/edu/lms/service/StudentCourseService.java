// src/main/java/edu/lms/service/StudentCourseService.java
package edu.lms.service;

import edu.lms.dto.response.*;
import edu.lms.entity.Enrollment;
import edu.lms.entity.UserLesson;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
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

    /** Danh sách khoá học đã ghi danh (nhẹ, không trả về lessons) */
    public List<StudentCourseListItemResponse> getCoursesSummary(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUser_UserID(userId);

        return enrollments.stream().map(enrollment -> {
            var course = enrollment.getCourse();
            var tutor  = course.getTutor();

            // Tính % tiến độ tổng quan = trung bình % các section
            double totalProgress = 0.0;
            int sectionCount = 0;
            if (course.getSections() != null) {
                for (var section : course.getSections()) {
                    var ucs = userCourseSectionRepository
                            .findByUser_UserIDAndSection_SectionID(userId, section.getSectionID())
                            .orElse(null);
                    double p = (ucs != null) ? ucs.getProgress().doubleValue() : 0.0;
                    totalProgress += p;
                    sectionCount++;
                }
            }
            double avg = sectionCount == 0 ? 0.0 : totalProgress / sectionCount;
            boolean completed = avg >= 99.9;

            return StudentCourseListItemResponse.builder()
                    .courseID(course.getCourseID())
                    .courseTitle(course.getTitle())
                    .tutorName(tutor != null && tutor.getUser() != null ? tutor.getUser().getFullName() : null)
                    .price(course.getPrice())
                    .language(course.getLanguage())
                    .thumbnailURL(course.getThumbnailURL())
                    .status(enrollment.getStatus().name())
                    .enrolledAt(enrollment.getCreatedAt())
                    .progressPercent(BigDecimal.valueOf(avg))
                    .isCompleted(completed)
                    .build();
        }).toList();
    }

    /** Chi tiết tiến độ 1 khoá: sections + lessons */
    public StudentCourseResponse getCourseDetail(Long userId, Long courseId) {
        var enrollment = enrollmentRepository
                .findByUser_UserIDAndCourse_CourseID(userId, courseId)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));

        var course  = enrollment.getCourse();
        var tutor   = course.getTutor();

        // Nếu khoá không có section
        if (course.getSections() == null || course.getSections().isEmpty()) {
            return StudentCourseResponse.builder()
                    .courseID(course.getCourseID())
                    .courseTitle(course.getTitle())
                    .tutorName(tutor != null && tutor.getUser() != null ? tutor.getUser().getFullName() : null)
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

        var sectionProgressList = course.getSections().stream().map(section -> {
            var ucs = userCourseSectionRepository
                    .findByUser_UserIDAndSection_SectionID(userId, section.getSectionID())
                    .orElse(null);
            BigDecimal sectionProgress = (ucs != null) ? ucs.getProgress() : BigDecimal.ZERO;
            boolean sectionDone = sectionProgress.compareTo(BigDecimal.valueOf(100)) >= 0;

            var lessonList = section.getLessons().stream().map(lesson -> {
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

        double totalProgress = sectionProgressList.stream()
                .mapToDouble(sp -> sp.getProgress().doubleValue())
                .average().orElse(0.0);
        boolean completed = totalProgress >= 99.9;

        return StudentCourseResponse.builder()
                .courseID(course.getCourseID())
                .courseTitle(course.getTitle())
                .tutorName(tutor != null && tutor.getUser() != null ? tutor.getUser().getFullName() : null)
                .price(course.getPrice())
                .language(course.getLanguage())
                .thumbnailURL(course.getThumbnailURL())
                .status(enrollment.getStatus().name())
                .enrolledAt(enrollment.getCreatedAt())
                .progressPercent(BigDecimal.valueOf(totalProgress))
                .isCompleted(completed)
                .sectionProgress(sectionProgressList)
                .build();
    }
}

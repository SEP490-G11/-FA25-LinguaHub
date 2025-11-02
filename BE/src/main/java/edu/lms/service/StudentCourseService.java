package edu.lms.service;

import edu.lms.dto.response.StudentCourseResponse;
import edu.lms.entity.Enrollment;
import edu.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final EnrollmentRepository enrollmentRepository;

    public List<StudentCourseResponse> getCoursesByStudent(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUser_UserID(userId);

        return enrollments.stream().map(enrollment -> {
            var course = enrollment.getCourse();
            var tutor = course.getTutor();
            return StudentCourseResponse.builder()
                    .courseID(course.getCourseID())
                    .courseTitle(course.getTitle())
                    .tutorName(tutor.getUser().getFullName())
                    .price(course.getPrice())
                    .language(course.getLanguage())
                    .thumbnailURL(course.getThumbnailURL())
                    .status(enrollment.getStatus().name())
                    .enrolledAt(enrollment.getCreatedAt())
                    .build();
        }).toList();
    }
}

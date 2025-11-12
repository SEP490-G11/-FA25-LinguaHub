package edu.lms.service;

import edu.lms.dto.response.AdminCourseResponse;
import edu.lms.entity.Course;
import edu.lms.enums.CourseStatus;
import edu.lms.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCourseService {

    private final CourseRepository courseRepository;

    private AdminCourseResponse toAdmin(Course c) {
        return AdminCourseResponse.builder()
                .id(c.getCourseID())
                .title(c.getTitle())
                .shortDescription(c.getShortDescription())
                .description(c.getDescription())
                .requirement(c.getRequirement())
                .level(c.getLevel())
                .duration(c.getDuration())
                .price(c.getPrice())
                .language(c.getLanguage())
                .thumbnailURL(c.getThumbnailURL())
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .tutorEmail(c.getTutor() != null ? c.getTutor().getUser().getEmail() : null)
                .tutorName(c.getTutor() != null ? c.getTutor().getUser().getFullName() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    public List<AdminCourseResponse> getAllCoursesForAdmin(CourseStatus status) {
        List<Course> courses = (status == null)
                ? courseRepository.findAll()
                : courseRepository.findByStatus(status);
        return courses.stream().map(this::toAdmin).toList();
    }

    public List<AdminCourseResponse> getAllCoursesForAdmin() {
        return courseRepository.findAll().stream()
                .map(this::toAdmin)
                .toList();
    }
}

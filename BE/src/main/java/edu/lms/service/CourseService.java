package edu.lms.service;

import edu.lms.dto.response.CourseResponse;
import edu.lms.entity.Course;
import edu.lms.entity.Tutor;
import edu.lms.enums.CourseStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.CourseRepository;
import edu.lms.repository.TutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TutorRepository tutorRepository;

    private CourseResponse toCourseResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getCourseID())
                .title(c.getTitle())
                .description(c.getDescription())
                .duration(c.getDuration())
                .price(c.getPrice())
                .language(c.getLanguage())
                .thumbnailURL(c.getThumbnailURL())
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .tutorName(c.getTutor() != null ? c.getTutor().getUser().getFullName() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .build();
    }

    public List<CourseResponse> getAllApproved() {
        return courseRepository.findByStatus(CourseStatus.Approved)
                .stream().map(this::toCourseResponse).toList();
    }

    public List<CourseResponse> getApprovedByTutor(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
        return courseRepository.findByTutorAndStatus(tutor, CourseStatus.Approved)
                .stream().map(this::toCourseResponse).toList();
    }

    public List<CourseResponse> getAllByStatus(CourseStatus status) {
        List<Course> courses = (status == null)
                ? courseRepository.findAll()
                : courseRepository.findByStatus(status);
        return courses.stream().map(this::toCourseResponse).toList();
    }

    public CourseResponse getCourseById(Long courseID) {
        Course c = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return toCourseResponse(c);
    }
}

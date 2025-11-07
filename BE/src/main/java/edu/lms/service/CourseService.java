package edu.lms.service;

import edu.lms.dto.response.*;
import edu.lms.entity.*;
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


    private LessonResourceResponse toLessonResourceResponse(LessonResource lr) {
        return LessonResourceResponse.builder()
                .resourceID(lr.getResourceID())
                .resourceType(lr.getResourceType())
                .resourceTitle(lr.getResourceTitle())
                .resourceURL(lr.getResourceURL())
                .uploadedAt(lr.getUploadedAt())
                .build();
    }


    private LessonResponse toLessonResponse(Lesson l) {
        return LessonResponse.builder()
                .lessonID(l.getLessonID())
                .title(l.getTitle())
                .duration(l.getDuration())
                .lessonType(l.getLessonType())
                .videoURL(l.getVideoURL())
                .content(l.getContent())
                .orderIndex(l.getOrderIndex())
                .createdAt(l.getCreatedAt())
                .resources(
                        l.getResources() != null
                                ? l.getResources().stream().map(this::toLessonResourceResponse).toList()
                                : null
                )
                .build();
    }

    private CourseSectionResponse toCourseSectionResponse(CourseSection s) {
        return CourseSectionResponse.builder()
                .sectionID(s.getSectionID())
                .courseID(s.getCourse().getCourseID())
                .title(s.getTitle())
                .description(s.getDescription())
                .orderIndex(s.getOrderIndex())
                .lessons(
                        s.getLessons() != null
                                ? s.getLessons().stream().map(this::toLessonResponse).toList()
                                : null
                )
                .build();
    }

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
                .section(
                        c.getSections() != null
                                ? c.getSections().stream().map(this::toCourseSectionResponse).toList()
                                : null
                )
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

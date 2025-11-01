package edu.lms.service;

import edu.lms.dto.request.TutorCourseRequest;
import edu.lms.dto.response.TutorCourseResponse;
import edu.lms.dto.response.TutorCourseStudentResponse;
import edu.lms.entity.Course;
import edu.lms.entity.CourseCategory;
import edu.lms.entity.Enrollment;
import edu.lms.entity.Tutor;
import edu.lms.enums.CourseStatus;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.TutorCourseMapper;
import edu.lms.repository.CourseCategoryRepository;
import edu.lms.repository.CourseRepository;
import edu.lms.repository.EnrollmentRepository;
import edu.lms.repository.TutorRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class TutorCourseService {

    TutorRepository tutorRepository;
    CourseRepository courseRepository;
    CourseCategoryRepository courseCategoryRepository;
    EnrollmentRepository enrollmentRepository;
    TutorCourseMapper tutorCourseMapper;

    //  CREATE COURSE
    public TutorCourseResponse createCourse(TutorCourseRequest request) {
        Tutor tutor = tutorRepository.findById(request.getTutorID())
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        if (tutor.getStatus() != TutorStatus.APPROVED)
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);

        CourseCategory category = courseCategoryRepository.findById(request.getCategoryID())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));

        Course course = tutorCourseMapper.toCourse(request);
        course.setTutor(tutor);
        course.setCategory(category);
        course.setStatus(CourseStatus.Draft);

        courseRepository.save(course);

        log.info("Tutor [{}] created new course [{}]", tutor.getTutorID(), course.getTitle());

        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    // GET COURSES BY TUTOR ID
    public List<TutorCourseResponse> getCoursesByTutorID(Long tutorID) {
        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        List<Course> courses = courseRepository.findByTutor(tutor);

        return courses.stream()
                .map(tutorCourseMapper::toTutorCourseResponse)
                .toList();
    }

    //  GET ALL COURSES
    public List<TutorCourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(tutorCourseMapper::toTutorCourseResponse)
                .toList();
    }

    // GET COURSE BY ID
    public TutorCourseResponse getCourseById(Long courseID) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    // UPDATE COURSE BY ID (only if not enrolled)
    public TutorCourseResponse updateCourse(Long courseID, TutorCourseRequest request) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (enrollmentRepository.existsByCourse(course)) {
            throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENT);
        }

        CourseCategory category = courseCategoryRepository.findById(request.getCategoryID())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setDuration(request.getDuration());
        course.setPrice(request.getPrice());
        course.setLanguage(request.getLanguage());
        course.setThumbnailURL(request.getThumbnailURL());
        course.setCategory(category);
        course.setUpdatedAt(java.time.LocalDateTime.now());

        courseRepository.save(course);

        log.info("Course [{}] updated successfully", courseID);

        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    // DELETE COURSE BY ID (only if not enrolled)
    public void deleteCourse(Long courseID) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (enrollmentRepository.existsByCourse(course)) {
            throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENT);
        }

        courseRepository.delete(course);

        log.warn("Course [{}] deleted successfully", courseID);
    }
    public List<TutorCourseStudentResponse> getStudentsByCourse(Long courseId, Long tutorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // Kiểm tra course có thuộc về tutor đang đăng nhập không
        if (!course.getTutor().getTutorID().equals(tutorId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<Enrollment> enrollments = enrollmentRepository.findAllByCourseId(courseId);

        return enrollments.stream().map(e -> {
            var u = e.getUser();
            return TutorCourseStudentResponse.builder()
                    .userId(u.getUserID())
                    .fullName(u.getFullName())
                    .email(u.getEmail())
                    .phone(u.getPhone())
                    .country(u.getCountry())
                    .enrolledAt(e.getCreatedAt())
                    .build();
        }).toList();
    }
}

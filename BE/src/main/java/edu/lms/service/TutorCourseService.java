package edu.lms.service;

import edu.lms.dto.request.TutorCourseRequest;
import edu.lms.dto.response.TutorCourseResponse;
import edu.lms.dto.response.TutorCourseStudentResponse;
import edu.lms.entity.*;
import edu.lms.enums.CourseStatus;
import edu.lms.enums.TutorStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.TutorCourseMapper;
import edu.lms.repository.*;
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
    UserRepository userRepository;
    CourseRepository courseRepository;
    CourseCategoryRepository courseCategoryRepository;
    EnrollmentRepository enrollmentRepository;
    CourseSectionRepository courseSectionRepository;
    LessonRepository lessonRepository;
    TutorCourseMapper tutorCourseMapper;
    LessonResourceRepository lessonResourceRepository;


    private Tutor resolveTutorByEmail(String email) {
        return tutorRepository.findByUser_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
    }

    private void ensureCourseOwner(Course course, Long tutorId) {
        if (!course.getTutor().getTutorID().equals(tutorId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    // Create

    public TutorCourseResponse createCourseForCurrentTutor(String email, TutorCourseRequest request) {
        Tutor tutor = resolveTutorByEmail(email);

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

    //View

    public List<TutorCourseResponse> getMyCourses(String email) {
        Tutor tutor = resolveTutorByEmail(email);
        List<Course> courses = courseRepository.findByTutor(tutor);
        return courses.stream().map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    public List<TutorCourseResponse> getMyCoursesByStatus(String email, CourseStatus status) {
        Tutor tutor = resolveTutorByEmail(email);
        List<Course> courses = (status == null)
                ? courseRepository.findByTutor(tutor)
                : courseRepository.findByTutorAndStatus(tutor, status);
        return courses.stream().map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    // Update

    public TutorCourseResponse updateCourseForCurrentTutor(String email, Long courseID, TutorCourseRequest request) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());

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
        log.info("Tutor [{}] updated course [{}]", tutor.getTutorID(), courseID);

        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    // Delete
    @Transactional
    public void deleteCourseForCurrentTutor(String email, Long courseID) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());
        // Chỉ cho xóa khi status = Draft
        if (course.getStatus() != CourseStatus.Draft) {
            throw new AppException(ErrorCode.COURSE_DELETE_ONLY_DRAFT);
        }
        var sections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        if (sections.isEmpty()) {
            courseRepository.delete(course);
            log.warn("Tutor [{}] deleted draft course [{}] (no sections)", tutor.getTutorID(), courseID);
            return;
        }
        var sectionIds = sections.stream().map(s -> s.getSectionID()).toList();
        var lessons = lessonRepository.findBySection_SectionIDIn(sectionIds);
        if (!lessons.isEmpty()) {
            var lessonIds = lessons.stream().map(l -> l.getLessonID()).toList();
            var resources = lessonResourceRepository.findByLesson_LessonIDIn(lessonIds);
            if (!resources.isEmpty()) {
                lessonResourceRepository.deleteAllInBatch(resources);
            }
            lessonRepository.deleteAllInBatch(lessons);
        }
        courseSectionRepository.deleteAllInBatch(sections);
        courseRepository.delete(course);
        log.warn("Tutor [{}] deleted draft course [{}] with resources -> lessons -> sections -> course",
                tutor.getTutorID(), courseID);
    }

    //Admin
    public List<TutorCourseResponse> getCoursesByTutorID(Long tutorID) {
        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
        List<Course> courses = courseRepository.findByTutor(tutor);
        return courses.stream().map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    public List<TutorCourseResponse> getCoursesByTutorAndStatus(Long tutorID, CourseStatus status) {
        Tutor tutor = tutorRepository.findById(tutorID)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
        List<Course> courses = (status == null)
                ? courseRepository.findByTutor(tutor)
                : courseRepository.findByTutorAndStatus(tutor, status);
        return courses.stream().map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    public List<TutorCourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    public List<TutorCourseResponse> getAllCoursesByStatus(CourseStatus status) {
        List<Course> courses = (status == null)
                ? courseRepository.findAll()
                : courseRepository.findByStatus(status);
        return courses.stream().map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    public TutorCourseResponse getCourseById(Long courseID) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    public List<TutorCourseStudentResponse> getStudentsByCourse(Long courseId, Long tutorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());

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

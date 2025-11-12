package edu.lms.service;

import edu.lms.dto.request.TutorCourseRequest;
import edu.lms.dto.response.*;
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

import java.time.LocalDateTime;
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
    CourseSectionRepository courseSectionRepository;
    LessonRepository lessonRepository;
    LessonResourceRepository lessonResourceRepository;
    TutorCourseMapper tutorCourseMapper;

    private Tutor resolveTutorByEmail(String email) {
        return tutorRepository.findByUser_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
    }

    private void ensureCourseOwner(Course course, Long tutorId) {
        if (!course.getTutor().getTutorID().equals(tutorId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    // Create (me)
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

    // View (me)
    public List<TutorCourseResponse> getMyCourses(String email) {
        Tutor tutor = resolveTutorByEmail(email);
        return courseRepository.findByTutor(tutor).stream()
                .map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    public List<TutorCourseResponse> getMyCoursesByStatus(String email, CourseStatus status) {
        Tutor tutor = resolveTutorByEmail(email);
        List<Course> courses = (status == null)
                ? courseRepository.findByTutor(tutor)
                : courseRepository.findByTutorAndStatus(tutor, status);
        return courses.stream().map(tutorCourseMapper::toTutorCourseResponse).toList();
    }

    // Update (me)
    public TutorCourseResponse updateCourseForCurrentTutor(String email, Long courseID, TutorCourseRequest request) {
        Tutor tutor = resolveTutorByEmail(email);
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());

        if (enrollmentRepository.existsByCourse(course)) {
            throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENT);
        }
//        if (course.getStatus() != CourseStatus.Rejected && course.getStatus() != CourseStatus.Draft ) {
//            throw new AppException(ErrorCode.COURSE_UPDATE_ONLY_DRAFT_OR_REJECTED);
//        }

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

    // Delete: chỉ khi Pending hoacj laf Draft, xoá Resource -> Lesson -> Section -> Course
    @Transactional
    public void deleteCourseForCurrentTutor(String email, Long courseID) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());

        if (course.getStatus() != CourseStatus.Rejected && course.getStatus() != CourseStatus.Draft ) {
            throw new AppException(ErrorCode.COURSE_DELETE_ONLY_DRAFT_OR_REJECTED);
        }

        var sections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        if (!sections.isEmpty()) {
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
        }
        courseRepository.delete(course);

        log.warn("Tutor [{}] deleted [{}] course [{}] with resources -> lessons -> sections -> course",
                tutor.getTutorID(), course.getStatus(), courseID);
    }

   //Lấy students đã enroll khóa học của tutor
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

    //detail cuar tutor
    public TutorCourseDetailResponse getMyCourseDetail(String email, Long courseID) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());
        return toTutorCourseDetailResponse(course);
    }

    //submit
    public TutorCourseResponse submitCourseForReview(String email, Long courseID) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());

        if (course.getStatus() == CourseStatus.Approved) {
            throw new AppException(ErrorCode.CAN_NOT_CHANGE_STATUS);
        }
        if (course.getStatus() != CourseStatus.Pending) {
            course.setStatus(CourseStatus.Pending);
            course.setUpdatedAt(LocalDateTime.now());
            courseRepository.save(course);
            log.info("Tutor [{}] submitted course [{}] for review (-> Pending)", tutor.getTutorID(), courseID);
        } else {
            log.info("Tutor [{}] re-submit course [{}] ignored (already Pending)", tutor.getTutorID(), courseID);
        }

        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    //MAPPERS for detail (Section -> Lesson -> Resource)
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
                        l.getResources() == null ? null :
                                l.getResources().stream().map(this::toLessonResourceResponse).toList()
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
                        s.getLessons() == null ? null :
                                s.getLessons().stream().map(this::toLessonResponse).toList()
                )
                .build();
    }

    private TutorCourseDetailResponse toTutorCourseDetailResponse(Course c) {
        return TutorCourseDetailResponse.builder()
                .id(c.getCourseID())
                .title(c.getTitle())
                .description(c.getDescription())
                .duration(c.getDuration())
                .price(c.getPrice())
                .language(c.getLanguage())
                .thumbnailURL(c.getThumbnailURL())
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .section(
                        c.getSections() == null ? null :
                                c.getSections().stream().map(this::toCourseSectionResponse).toList()
                )
                .build();
    }



}

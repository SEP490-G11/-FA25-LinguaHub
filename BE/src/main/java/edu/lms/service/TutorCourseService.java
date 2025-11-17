// src/main/java/edu/lms/service/TutorCourseService.java
package edu.lms.service;

import edu.lms.dto.request.TutorCourseRequest;
import edu.lms.dto.response.*;
import edu.lms.entity.*;
import edu.lms.enums.CourseDraftStatus;
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
import java.util.Comparator;
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
    CourseObjectiveRepository courseObjectiveRepository;
    CourseObjectiveDraftRepository courseObjectiveDraftRepository;

    // NEW: thêm các repo cho Draft
    CourseDraftRepository courseDraftRepository;
    CourseSectionDraftRepository courseSectionDraftRepository;
    LessonDraftRepository lessonDraftRepository;
    LessonResourceDraftRepository lessonResourceDraftRepository;

    // ====================== COMMON HELPERS ======================

    private Tutor resolveTutorByEmail(String email) {
        return tutorRepository.findByUser_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));
    }

    private void ensureCourseOwner(Course course, Long tutorId) {
        if (!course.getTutor().getTutorID().equals(tutorId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private void ensureDraftOwner(CourseDraft draft, Long tutorId) {
        if (!draft.getTutor().getTutorID().equals(tutorId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
   //
   public TutorCourseDetailResponse startEditCourseDirect(String email, Long courseID) {
       Tutor tutor = resolveTutorByEmail(email);

       Course course = courseRepository.findById(courseID)
               .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

       ensureCourseOwner(course, tutor.getTutorID());

       // Nếu đã có learner enroll → dùng flow Draft (cũ)
       if (enrollmentRepository.existsByCourse(course)) {
           throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENT);
       }

       // Nếu đang Approved → chuyển thành Draft để sửa
       if (course.getStatus() == CourseStatus.Approved) {
           course.setStatus(CourseStatus.Draft);
           course.setUpdatedAt(LocalDateTime.now());
           courseRepository.save(course);
       }

       // Trả về detail của bản live (đang ở trạng thái Draft)
       return toTutorCourseDetailResponse(course);
   }

    // ========================== FLOW COURSE LIVE ============================

    // Create (me)
    public TutorCourseResponse createCourseForCurrentTutor(String email, TutorCourseRequest request) {
        Tutor tutor = resolveTutorByEmail(email);

        if (tutor.getStatus() != TutorStatus.APPROVED)
            throw new AppException(ErrorCode.TUTOR_NOT_APPROVED);

        CourseCategory category = courseCategoryRepository.findById(request.getCategoryID())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));

        // Tạo entity Course từ mapper
        Course course = tutorCourseMapper.toCourse(request);
        course.setTutor(tutor);
        course.setCategory(category);
        course.setStatus(CourseStatus.Draft);

        // Bổ sung các trường mới (nếu mapper chưa tự map)
        course.setShortDescription(request.getShortDescription());
        course.setRequirement(request.getRequirement());
        course.setLevel(request.getLevel());

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

    // Update (me) – CHỈ dùng cho course chưa có enrollment
    public TutorCourseResponse updateCourseForCurrentTutor(String email, Long courseID, TutorCourseRequest request) {
        // 1. Lấy tutor từ email
        Tutor tutor = resolveTutorByEmail(email);

        // 2. Lấy course
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // 3. Check quyền sở hữu khóa học
        ensureCourseOwner(course, tutor.getTutorID());

        // 4. Nếu đã có learner enroll → không cho sửa trực tiếp, phải dùng flow Draft
        if (enrollmentRepository.existsByCourse(course)) {
            throw new AppException(ErrorCode.COURSE_HAS_ENROLLMENT); // FE sẽ gọi API draft
        }

        // 5. Nếu course đang Approved mà tutor chỉnh sửa metadata
        //    => chuyển về Pending để Admin duyệt lại
        if (course.getStatus() == CourseStatus.Approved) {
            course.setStatus(CourseStatus.Pending);
        }
        // Các trạng thái khác:
        // - Draft: sửa thoải mái, sau này tutor gọi /submit để gửi duyệt
        // - Pending: đang chờ duyệt, sửa thêm vẫn giữ Pending
        // - Rejected: sửa xong, tutor lại gọi /submit để chuyển về Pending

        // 6. Lấy category
        CourseCategory category = courseCategoryRepository.findById(request.getCategoryID())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));

        // 7. Gán các trường metadata
        course.setTitle(request.getTitle());
        course.setShortDescription(request.getShortDescription());
        course.setDescription(request.getDescription());
        course.setRequirement(request.getRequirement());
        course.setLevel(request.getLevel());
        course.setDuration(request.getDuration());
        course.setPrice(request.getPrice());
        course.setLanguage(request.getLanguage());
        course.setThumbnailURL(request.getThumbnailURL());
        course.setCategory(category);
        course.setUpdatedAt(LocalDateTime.now());

        // 8. Lưu lại
        courseRepository.save(course);

        log.info("Tutor [{}] updated course [{}] (status after update: {})",
                tutor.getTutorID(), courseID, course.getStatus());

        // 9. Trả về response
        return tutorCourseMapper.toTutorCourseResponse(course);
    }

    // Delete: chỉ khi Pending hoặc Draft hoặc Rejected
    @Transactional
    public void deleteCourseForCurrentTutor(String email, Long courseID) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());

        if (course.getStatus() != CourseStatus.Rejected && course.getStatus() != CourseStatus.Draft) {
            throw new AppException(ErrorCode.COURSE_DELETE_ONLY_DRAFT_OR_REJECTED);
        }

        var sections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        if (!sections.isEmpty()) {
            var sectionIds = sections.stream().map(CourseSection::getSectionID).toList();
            var lessons = lessonRepository.findBySection_SectionIDIn(sectionIds);
            if (!lessons.isEmpty()) {
                var lessonIds = lessons.stream().map(Lesson::getLessonID).toList();
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

    // Lấy students đã enroll khóa học của tutor
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

    // detail của tutor (live course)
    public TutorCourseDetailResponse getMyCourseDetail(String email, Long courseID) {
        Tutor tutor = resolveTutorByEmail(email);

        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        ensureCourseOwner(course, tutor.getTutorID());
        return toTutorCourseDetailResponse(course);
    }

    // submit lần đầu (Course live → Pending)
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

    // ========================== FLOW COURSE DRAFT ============================

    // 1) Tutor bắt đầu/chỉnh sửa draft update cho 1 course đã Approved
    @Transactional
    public TutorCourseDetailResponse startEditCourseDraft(String email, Long courseID) {
        // 1. Lấy tutor từ email
        Tutor tutor = resolveTutorByEmail(email);

        // 2. Lấy course live
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // 3. Check quyền sở hữu
        ensureCourseOwner(course, tutor.getTutorID());

        // 4. Chỉ cho phép tạo draft / edit cho course đã Approved
        if (course.getStatus() != CourseStatus.Approved) {
            throw new AppException(ErrorCode.CAN_ONLY_EDIT_DRAFT_FOR_APPROVED_COURSE);
        }

        // 5. Nếu đã có draft đang EDITING hoặc PENDING_REVIEW thì dùng lại
        var existingDraftOpt = courseDraftRepository.findByCourse_CourseIDAndStatusIn(
                courseID,
                List.of(CourseDraftStatus.EDITING, CourseDraftStatus.PENDING_REVIEW)
        );
        if (existingDraftOpt.isPresent()) {
            log.info("Tutor [{}] reuse existing draft [{}] for course [{}]",
                    tutor.getTutorID(), existingDraftOpt.get().getDraftID(), courseID);
            return toTutorCourseDetailResponse(existingDraftOpt.get());
        }

        // 6. Tạo draft mới từ bản live (clone metadata)
        CourseDraft draft = CourseDraft.builder()
                .course(course)
                .tutor(course.getTutor())
                .category(course.getCategory())
                .title(course.getTitle())
                .shortDescription(course.getShortDescription())
                .description(course.getDescription())
                .requirement(course.getRequirement())
                .level(course.getLevel())
                .duration(course.getDuration())
                .price(course.getPrice())
                .language(course.getLanguage())
                .thumbnailURL(course.getThumbnailURL())
                .status(CourseDraftStatus.EDITING)
                .build();

        courseDraftRepository.save(draft);

        // 7. Clone Section/Lesson/Resource sang bản draft
        var sections = course.getSections();
        if (sections != null) {
            for (CourseSection s : sections) {
                CourseSectionDraft sd = CourseSectionDraft.builder()
                        .draft(draft)
                        .originalSectionID(s.getSectionID())   // GÁN ID GỐC
                        .title(s.getTitle())
                        .description(s.getDescription())
                        .orderIndex(s.getOrderIndex())
                        .build();
                courseSectionDraftRepository.save(sd);

                if (s.getLessons() != null) {
                    for (Lesson l : s.getLessons()) {
                        LessonDraft ld = LessonDraft.builder()
                                .sectionDraft(sd)
                                .originalLessonID(l.getLessonID())     // GÁN ID GỐC
                                .title(l.getTitle())
                                .duration(l.getDuration())
                                .lessonType(l.getLessonType())
                                .videoURL(l.getVideoURL())
                                .content(l.getContent())
                                .orderIndex(l.getOrderIndex())
                                .build();
                        lessonDraftRepository.save(ld);

                        if (l.getResources() != null) {
                            for (LessonResource r : l.getResources()) {
                                LessonResourceDraft rd = LessonResourceDraft.builder()
                                        .lessonDraft(ld)
                                        .originalResourceID(r.getResourceID()) // GÁN ID GỐC
                                        .resourceType(r.getResourceType())
                                        .resourceTitle(r.getResourceTitle())
                                        .resourceURL(r.getResourceURL())
                                        .build();

                                lessonResourceDraftRepository.save(rd);
                            }
                        }
                    }
                }
            }
        }

        // 8. Clone Objective sang bản draft (nếu course có objectives)
        var objectives = course.getObjectives(); // dùng quan hệ @OneToMany trong Course
        if (objectives != null) {
            for (CourseObjective o : objectives) {
                CourseObjectiveDraft od = CourseObjectiveDraft.builder()
                        .draft(draft)
                        .originalObjectiveID(o.getObjectiveID())  // GÁN ID GỐC
                        .objectiveText(o.getObjectiveText())
                        .orderIndex(o.getOrderIndex())
                        .build();
                courseObjectiveDraftRepository.save(od);
            }
        }

        log.info("Tutor [{}] started new draft [{}] for course [{}] (always clone from Approved)",
                tutor.getTutorID(), draft.getDraftID(), courseID);

        // 9. Trả về detail dựa trên bản draft (sections + lessons + resources + objectives draft)
        return toTutorCourseDetailResponse(draft);
    }


    // 2) Tutor xem chi tiết bản draft
    public TutorCourseDetailResponse getMyCourseDraftDetail(String email, Long draftID) {
        Tutor tutor = resolveTutorByEmail(email);

        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        ensureDraftOwner(draft, tutor.getTutorID());

        return toTutorCourseDetailResponse(draft);
    }

    // 3) Tutor update metadata của draft (title, desc, price,...)
    public TutorCourseDetailResponse updateCourseDraftInfo(String email, Long draftID, TutorCourseRequest request) {
        Tutor tutor = resolveTutorByEmail(email);

        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        ensureDraftOwner(draft, tutor.getTutorID());

        if (draft.getStatus() != CourseDraftStatus.EDITING) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        CourseCategory category = courseCategoryRepository.findById(request.getCategoryID())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_CATEGORY_NOT_FOUND));

        draft.setTitle(request.getTitle());
        draft.setShortDescription(request.getShortDescription());
        draft.setDescription(request.getDescription());
        draft.setRequirement(request.getRequirement());
        draft.setLevel(request.getLevel());
        draft.setDuration(request.getDuration());
        draft.setPrice(request.getPrice());
        draft.setLanguage(request.getLanguage());
        draft.setThumbnailURL(request.getThumbnailURL());
        draft.setCategory(category);
        draft.setUpdatedAt(LocalDateTime.now());

        return toTutorCourseDetailResponse(draft);
    }

    // 4) Tutor submit draft cho admin duyệt
    public TutorCourseDetailResponse submitCourseDraftForReview(String email, Long draftID) {
        Tutor tutor = resolveTutorByEmail(email);

        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        ensureDraftOwner(draft, tutor.getTutorID());

        if (draft.getStatus() == CourseDraftStatus.PENDING_REVIEW) {
            log.info("Tutor [{}] re-submit draft [{}] ignored (already PENDING_REVIEW)", tutor.getTutorID(), draftID);
            return toTutorCourseDetailResponse(draft);
        }

        if (draft.getStatus() != CourseDraftStatus.EDITING) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        draft.setStatus(CourseDraftStatus.PENDING_REVIEW);
        draft.setUpdatedAt(LocalDateTime.now());

        log.info("Tutor [{}] submitted draft [{}] for review", tutor.getTutorID(), draftID);
        return toTutorCourseDetailResponse(draft);
    }

    // ================== MAPPERS cho LIVE & DRAFT DETAIL =====================

    // LIVE: LessonResource
    private LessonResourceResponse toLessonResourceResponse(LessonResource lr) {
        return LessonResourceResponse.builder()
                .resourceID(lr.getResourceID())
                .resourceType(lr.getResourceType())
                .resourceTitle(lr.getResourceTitle())
                .resourceURL(lr.getResourceURL())
                .uploadedAt(lr.getUploadedAt())
                .build();
    }

    // DRAFT: LessonResourceDraft
    private LessonResourceResponse toLessonResourceResponse(LessonResourceDraft lr) {
        return LessonResourceResponse.builder()
                // dùng id draft hoặc originalResourceID tùy FE, ở đây anh để id draft
                .resourceID(lr.getResourceDraftID())
                .resourceType(lr.getResourceType())
                .resourceTitle(lr.getResourceTitle())
                .resourceURL(lr.getResourceURL())
                .uploadedAt(null) // Draft không có uploadedAt -> để null
                .build();
    }

    // LIVE: Lesson
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

    // DRAFT: LessonDraft
    private LessonResponse toLessonResponse(LessonDraft l) {
        return LessonResponse.builder()
                .lessonID(l.getLessonDraftID()) // dùng id draft
                .title(l.getTitle())
                .duration(l.getDuration())
                .lessonType(l.getLessonType())
                .videoURL(l.getVideoURL())
                .content(l.getContent())
                .orderIndex(l.getOrderIndex())
                .createdAt(null) // Draft không có createdAt -> để null
                .resources(
                        l.getResources() == null ? null :
                                l.getResources().stream().map(this::toLessonResourceResponse).toList()
                )
                .build();
    }

    // LIVE: CourseSection
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

    // DRAFT: CourseSectionDraft
    private CourseSectionResponse toCourseSectionResponse(CourseSectionDraft s) {
        return CourseSectionResponse.builder()
                .sectionID(s.getSectionDraftID()) // dùng id draft
                .courseID(s.getDraft().getCourse().getCourseID())
                .title(s.getTitle())
                .description(s.getDescription())
                .orderIndex(s.getOrderIndex())
                .lessons(
                        s.getLessons() == null ? null :
                                s.getLessons().stream().map(this::toLessonResponse).toList()
                )
                .build();
    }

    // LIVE: detail course
    private TutorCourseDetailResponse toTutorCourseDetailResponse(Course c) {
        return TutorCourseDetailResponse.builder()
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
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .section(
                        c.getSections() == null ? null :
                                c.getSections().stream().map(this::toCourseSectionResponse).toList()
                )
                .objectives(
                        c.getObjectives() == null ? List.of() :
                                c.getObjectives().stream()
                                        .sorted(Comparator.comparing(CourseObjective::getOrderIndex))
                                        .map(CourseObjective::getObjectiveText)
                                        .toList()
                )
                .build();
    }

    // DRAFT: detail course
    private TutorCourseDetailResponse toTutorCourseDetailResponse(CourseDraft d) {
        return TutorCourseDetailResponse.builder()
                .id(d.getDraftID()) // id draft
                .title(d.getTitle())
                .shortDescription(d.getShortDescription())
                .description(d.getDescription())
                .requirement(d.getRequirement())
                .level(d.getLevel())
                .duration(d.getDuration())
                .price(d.getPrice())
                .language(d.getLanguage())
                .thumbnailURL(d.getThumbnailURL())
                .categoryName(d.getCategory() != null ? d.getCategory().getName() : null)
                .status(d.getStatus() != null ? d.getStatus().name() : null)
                .section(
                        d.getSections() == null ? null :
                                d.getSections().stream().map(this::toCourseSectionResponse).toList()
                )
                // OBJECTIVES LẤY TỪ DRAFT
                .objectives(
                        d.getObjectives() == null ? List.of() :
                                d.getObjectives().stream()
                                        .sorted(Comparator.comparing(CourseObjectiveDraft::getOrderIndex))
                                        .map(CourseObjectiveDraft::getObjectiveText)
                                        .toList()
                )
                .build();
    }
}

// src/main/java/edu/lms/service/AdminCourseService.java
package edu.lms.service;

import edu.lms.dto.response.*;
import edu.lms.entity.*;
import edu.lms.enums.CourseDraftStatus;
import edu.lms.enums.CourseStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class AdminCourseService {

    CourseRepository courseRepository;
    CourseObjectiveRepository courseObjectiveRepository;
    CourseObjectiveDraftRepository courseObjectiveDraftRepository;
    CourseDraftRepository courseDraftRepository;
    CourseSectionRepository courseSectionRepository;
    LessonRepository lessonRepository;
    LessonResourceRepository lessonResourceRepository;
    UserLessonRepository userLessonRepository;
    UserCourseSectionRepository userCourseSectionRepository;
    EnrollmentRepository enrollmentRepository;
    EmailService emailService;

    // ====================== MAPPER CHO COURSE LIVE ======================

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
                .adminReviewNote(c.getAdminReviewNote())
                .build();
    }

    // ====================== MAPPER CHO COURSE DRAFT ======================

    private AdminCourseDraftResponse toAdminDraft(CourseDraft d) {
        return AdminCourseDraftResponse.builder()
                .draftID(d.getDraftID())
                .courseID(d.getCourse().getCourseID())
                .title(d.getTitle())
                .shortDescription(d.getShortDescription())
                .description(d.getDescription())
                .requirement(d.getRequirement())
                .level(d.getLevel() != null ? d.getLevel().name() : null)
                .duration(d.getDuration())
                .price(d.getPrice())
                .language(d.getLanguage())
                .thumbnailURL(d.getThumbnailURL())
                .categoryName(d.getCategory() != null ? d.getCategory().getName() : null)
                .tutorEmail(d.getTutor() != null ? d.getTutor().getUser().getEmail() : null)
                .tutorName(d.getTutor() != null ? d.getTutor().getUser().getFullName() : null)
                .status(d.getStatus() != null ? d.getStatus().name() : null)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .adminReviewNote(d.getAdminReviewNote())
                .build();
    }

    // ====================== MAPPERS CURRICULUM LIVE & DRAFT ======================

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
                .resourceID(lr.getResourceDraftID()) // id draft
                .resourceType(lr.getResourceType())
                .resourceTitle(lr.getResourceTitle())
                .resourceURL(lr.getResourceURL())
                .uploadedAt(null) // draft không có uploadedAt
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
                        l.getResources() == null ? List.of()
                                : l.getResources().stream()
                                .map(this::toLessonResourceResponse)
                                .toList()
                )
                .build();
    }

    // DRAFT: LessonDraft
    private LessonResponse toLessonResponse(LessonDraft l) {
        return LessonResponse.builder()
                .lessonID(l.getLessonDraftID()) // id draft
                .title(l.getTitle())
                .duration(l.getDuration())
                .lessonType(l.getLessonType())
                .videoURL(l.getVideoURL())
                .content(l.getContent())
                .orderIndex(l.getOrderIndex())
                .createdAt(null)
                .resources(
                        l.getResources() == null ? List.of()
                                : l.getResources().stream()
                                .map(this::toLessonResourceResponse)
                                .toList()
                )
                .build();
    }

    // LIVE: Section
    private CourseSectionResponse toCourseSectionResponse(CourseSection s) {
        return CourseSectionResponse.builder()
                .sectionID(s.getSectionID())
                .courseID(s.getCourse().getCourseID())
                .title(s.getTitle())
                .description(s.getDescription())
                .orderIndex(s.getOrderIndex())
                .lessons(
                        s.getLessons() == null ? List.of()
                                : s.getLessons().stream()
                                .sorted(
                                        Comparator.comparing(
                                                Lesson::getOrderIndex,
                                                Comparator.nullsLast(Integer::compareTo)
                                        )
                                )
                                .map(this::toLessonResponse)
                                .toList()
                )
                .build();
    }

    // DRAFT: SectionDraft
    private CourseSectionResponse toCourseSectionResponse(CourseSectionDraft s) {
        return CourseSectionResponse.builder()
                .sectionID(s.getSectionDraftID()) // id draft
                .courseID(s.getDraft().getCourse().getCourseID())
                .title(s.getTitle())
                .description(s.getDescription())
                .orderIndex(s.getOrderIndex())
                .lessons(
                        s.getLessons() == null ? List.of()
                                : s.getLessons().stream()
                                .sorted(
                                        Comparator.comparing(
                                                LessonDraft::getOrderIndex,
                                                Comparator.nullsLast(Integer::compareTo)
                                        )
                                )
                                .map(this::toLessonResponse)
                                .toList()
                )
                .build();
    }

    // ====================== DETAIL MAPPER LIVE & DRAFT ======================

    private AdminCourseDetailResponse toAdminDetail(Course c) {
        return AdminCourseDetailResponse.builder()
                .id(c.getCourseID())
                .courseID(c.getCourseID())
                .draft(false)
                .title(c.getTitle())
                .shortDescription(c.getShortDescription())
                .description(c.getDescription())
                .requirement(c.getRequirement())
                .level(c.getLevel() != null ? c.getLevel().name() : null)
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
                .adminReviewNote(c.getAdminReviewNote())
                .sections(
                        c.getSections() == null ? List.of()
                                : c.getSections().stream()
                                .sorted(Comparator.comparing(
                                        CourseSection::getOrderIndex,
                                        Comparator.nullsLast(Integer::compareTo)
                                ))
                                .map(this::toCourseSectionResponse)
                                .toList()
                )
                .objectives(
                        c.getObjectives() == null ? List.of()
                                : c.getObjectives().stream()
                                .sorted(Comparator.comparing(
                                        CourseObjective::getOrderIndex,
                                        Comparator.nullsLast(Integer::compareTo)
                                ))
                                .map(CourseObjective::getObjectiveText)
                                .toList()
                )
                .build();
    }

    private AdminCourseDetailResponse toAdminDetail(CourseDraft d) {
        return AdminCourseDetailResponse.builder()
                .id(d.getDraftID())
                .courseID(d.getCourse().getCourseID())
                .draft(true)
                .title(d.getTitle())
                .shortDescription(d.getShortDescription())
                .description(d.getDescription())
                .requirement(d.getRequirement())
                .level(d.getLevel() != null ? d.getLevel().name() : null)
                .duration(d.getDuration())
                .price(d.getPrice())
                .language(d.getLanguage())
                .thumbnailURL(d.getThumbnailURL())
                .categoryName(d.getCategory() != null ? d.getCategory().getName() : null)
                .tutorEmail(d.getTutor() != null ? d.getTutor().getUser().getEmail() : null)
                .tutorName(d.getTutor() != null ? d.getTutor().getUser().getFullName() : null)
                .status(d.getStatus() != null ? d.getStatus().name() : null)
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .adminReviewNote(d.getAdminReviewNote())
                .sections(
                        d.getSections() == null ? List.of()
                                : d.getSections().stream()
                                .sorted(Comparator.comparing(
                                        CourseSectionDraft::getOrderIndex,
                                        Comparator.nullsLast(Integer::compareTo)
                                ))
                                .map(this::toCourseSectionResponse)
                                .toList()
                )
                .objectives(
                        d.getObjectives() == null ? List.of()
                                : d.getObjectives().stream()
                                .sorted(Comparator.comparing(
                                        CourseObjectiveDraft::getOrderIndex,
                                        Comparator.nullsLast(Integer::compareTo)
                                ))
                                .map(CourseObjectiveDraft::getObjectiveText)
                                .toList()
                )
                .build();
    }

    // ====================== COURSE LIVE CHO ADMIN ======================

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

    public AdminCourseDetailResponse getCourseDetail(Long courseID) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return toAdminDetail(course);
    }

    // ========= UPDATE REVIEW NOTE CHO COURSE LIVE & DRAFT =========

    @Transactional
    public AdminCourseDetailResponse updateCourseReviewNote(Long courseID, String note) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        course.setAdminReviewNote(note);
        course.setUpdatedAt(LocalDateTime.now());
        return toAdminDetail(course);
    }

    @Transactional
    public AdminCourseDetailResponse updateCourseDraftReviewNote(Long draftID, String note) {
        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        draft.setAdminReviewNote(note);
        draft.setUpdatedAt(LocalDateTime.now());
        return toAdminDetail(draft);
    }

    // ====================== COURSE DRAFT CHO ADMIN ======================

    public List<AdminCourseDraftResponse> getCourseDraftsForAdmin(CourseDraftStatus status) {
        List<CourseDraft> drafts = (status == null)
                ? courseDraftRepository.findAll()
                : courseDraftRepository.findByStatus(status);
        return drafts.stream().map(this::toAdminDraft).toList();
    }

    public AdminCourseDraftResponse getCourseDraftDetail(Long draftID) {
        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));
        return toAdminDraft(draft);
    }

    public AdminCourseDetailResponse getCourseDraftDetailWithCurriculum(Long draftID) {
        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));
        return toAdminDetail(draft);
    }

    // ====================== APPROVE / REJECT COURSE LIVE ======================

    @Transactional
    public AdminCourseResponse approveLiveCourse(Long courseID, String note) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != CourseStatus.Pending) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        course.setStatus(CourseStatus.Approved);
        course.setAdminReviewNote(note);
        course.setUpdatedAt(LocalDateTime.now());

        courseRepository.save(course);

        // 👇 gửi email cho tutor
        notifyTutorCourseApproved(course, note);

        return toAdmin(course);
    }

    @Transactional
    public AdminCourseResponse rejectLiveCourse(Long courseID, String note) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getStatus() != CourseStatus.Pending) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        course.setStatus(CourseStatus.Rejected);
        course.setAdminReviewNote(note);
        course.setUpdatedAt(LocalDateTime.now());

        courseRepository.save(course);

        // 👇 gửi email cho tutor
        notifyTutorCourseRejected(course, note);

        return toAdmin(course);
    }

    // ====================== APPROVE / REJECT DRAFT ======================

    @Transactional
    public AdminCourseResponse approveCourseDraft(Long draftID) {
        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        if (draft.getStatus() != CourseDraftStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        Course course = draft.getCourse();

        // 🔹 build diff để gửi mail cho learner
        AdminCourseDraftChangesResponse changes = buildDraftChanges(course, draft);

        //  1. Tìm các lesson cần reset progress (VIDEO đổi URL, READING đổi content)
        List<Long> lessonIdsNeedReset = findLessonIdsNeedResetProgress(course, draft);

        //  2. Update metadata từ draft → course live
        course.setTitle(draft.getTitle());
        course.setShortDescription(draft.getShortDescription());
        course.setDescription(draft.getDescription());
        course.setRequirement(draft.getRequirement());
        course.setLevel(draft.getLevel());
        course.setDuration(draft.getDuration());
        course.setPrice(draft.getPrice());
        course.setLanguage(draft.getLanguage());
        course.setThumbnailURL(draft.getThumbnailURL());
        course.setCategory(draft.getCategory());
        course.setTutor(draft.getTutor());
        course.setUpdatedAt(LocalDateTime.now());

        courseRepository.save(course);

        //  3. Sync curriculum (Section / Lesson / Resource)
        syncCurriculumFromDraft(course, draft);

        //  4. Sync objectives
        syncObjectivesFromDraft(course, draft);

        //  5. Xóa progress của các lesson bị ảnh hưởng
        if (!lessonIdsNeedReset.isEmpty()) {
            userLessonRepository.deleteByLesson_LessonIDIn(lessonIdsNeedReset);
        }

        //  6. Xóa draft sau khi merge
        courseDraftRepository.delete(draft);

        //  7. Gửi email cho learner đã enroll
        notifyLearnersCourseUpdated(course, changes);
        notifyTutorCourseDraftApproved(draft, changes);


        return toAdmin(course);
    }

    @Transactional
    public void rejectCourseDraft(Long draftID, String note) {
        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        if (draft.getStatus() != CourseDraftStatus.PENDING_REVIEW) {
            throw new AppException(ErrorCode.INVALID_STATE);
        }

        draft.setStatus(CourseDraftStatus.REJECTED);
        draft.setUpdatedAt(LocalDateTime.now());
        draft.setAdminReviewNote(note);
        // @Transactional sẽ tự flush
        notifyTutorCourseDraftRejected(draft, note);
    }

    @Transactional
    public void rejectCourseDraft(Long draftID) {
        rejectCourseDraft(draftID, null);
    }

    // ====================== SYNC CURRICULUM ======================

    private void syncCurriculumFromDraft(Course course, CourseDraft draft) {

        // ------- LOAD LIVE DATA -------
        List<CourseSection> liveSections =
                courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        Map<Long, CourseSection> liveSectionMap = liveSections.stream()
                .collect(Collectors.toMap(CourseSection::getSectionID, s -> s));

        List<Long> sectionIds = liveSections.stream()
                .map(CourseSection::getSectionID)
                .toList();
        List<Lesson> liveLessons = sectionIds.isEmpty()
                ? List.of()
                : lessonRepository.findBySection_SectionIDIn(sectionIds);
        Map<Long, Lesson> liveLessonMap = liveLessons.stream()
                .collect(Collectors.toMap(Lesson::getLessonID, l -> l));

        List<Long> lessonIds = liveLessons.stream()
                .map(Lesson::getLessonID)
                .toList();
        List<LessonResource> liveResources = lessonIds.isEmpty()
                ? List.of()
                : lessonResourceRepository.findByLesson_LessonIDIn(lessonIds);
        Map<Long, LessonResource> liveResourceMap = liveResources.stream()
                .collect(Collectors.toMap(LessonResource::getResourceID, r -> r));

        // ------- APPLY DRAFT -------
        if (draft.getSections() != null) {
            for (CourseSectionDraft sd : draft.getSections()) {

                CourseSection liveSection;

                // 1. SECTION: update hoặc create
                if (sd.getOriginalSectionID() != null
                        && liveSectionMap.containsKey(sd.getOriginalSectionID())) {

                    // Update section cũ
                    liveSection = liveSectionMap.get(sd.getOriginalSectionID());
                    liveSection.setTitle(sd.getTitle());
                    liveSection.setDescription(sd.getDescription());
                    liveSection.setOrderIndex(sd.getOrderIndex());

                    // Đã xử lý section này -> remove khỏi map để lát nữa không xóa
                    liveSectionMap.remove(sd.getOriginalSectionID());
                } else {
                    // Section mới
                    liveSection = CourseSection.builder()
                            .course(course)
                            .title(sd.getTitle())
                            .description(sd.getDescription())
                            .orderIndex(sd.getOrderIndex())
                            .build();
                    courseSectionRepository.save(liveSection);
                }

                // 2. LESSONS trong section này
                if (sd.getLessons() != null) {
                    // Lấy các lesson live thuộc section này
                    Map<Long, Lesson> lessonsOfSection = liveLessonMap.entrySet().stream()
                            .filter(e -> e.getValue().getSection().getSectionID()
                                    .equals(liveSection.getSectionID()))
                            .collect(Collectors.toMap(
                                    Map.Entry::getKey,
                                    Map.Entry::getValue
                            ));

                    for (LessonDraft ld : sd.getLessons()) {
                        Lesson liveLesson;

                        if (ld.getOriginalLessonID() != null
                                && lessonsOfSection.containsKey(ld.getOriginalLessonID())) {

                            // Update lesson cũ
                            liveLesson = lessonsOfSection.get(ld.getOriginalLessonID());
                            liveLesson.setTitle(ld.getTitle());
                            liveLesson.setDuration(ld.getDuration());
                            liveLesson.setLessonType(ld.getLessonType());
                            liveLesson.setVideoURL(ld.getVideoURL());
                            liveLesson.setContent(ld.getContent());
                            liveLesson.setOrderIndex(ld.getOrderIndex());

                            // Đánh dấu đã dùng
                            lessonsOfSection.remove(ld.getOriginalLessonID());
                            liveLessonMap.remove(ld.getOriginalLessonID());
                        } else {
                            // Lesson mới
                            liveLesson = Lesson.builder()
                                    .section(liveSection)
                                    .title(ld.getTitle())
                                    .duration(ld.getDuration())
                                    .lessonType(ld.getLessonType())
                                    .videoURL(ld.getVideoURL())
                                    .content(ld.getContent())
                                    .orderIndex(ld.getOrderIndex())
                                    .createdAt(LocalDateTime.now())
                                    .build();
                            lessonRepository.save(liveLesson);
                        }

                        // 3. RESOURCES trong lesson
                        if (ld.getResources() != null) {

                            Map<Long, LessonResource> resourcesOfLesson = liveResourceMap.entrySet().stream()
                                    .filter(e -> e.getValue().getLesson().getLessonID()
                                            .equals(liveLesson.getLessonID()))
                                    .collect(Collectors.toMap(
                                            Map.Entry::getKey,
                                            Map.Entry::getValue
                                    ));

                            for (LessonResourceDraft rd : ld.getResources()) {
                                if (rd.getOriginalResourceID() != null
                                        && resourcesOfLesson.containsKey(rd.getOriginalResourceID())) {

                                    // Update resource cũ
                                    LessonResource res = resourcesOfLesson.get(rd.getOriginalResourceID());
                                    res.setResourceType(rd.getResourceType());
                                    res.setResourceTitle(rd.getResourceTitle());
                                    res.setResourceURL(rd.getResourceURL());

                                    resourcesOfLesson.remove(rd.getOriginalResourceID());
                                    liveResourceMap.remove(rd.getOriginalResourceID());
                                } else {
                                    // Resource mới
                                    LessonResource res = LessonResource.builder()
                                            .lesson(liveLesson)
                                            .resourceType(rd.getResourceType())
                                            .resourceTitle(rd.getResourceTitle())
                                            .resourceURL(rd.getResourceURL())
                                            .uploadedAt(LocalDateTime.now())
                                            .build();
                                    lessonResourceRepository.save(res);
                                }
                            }

                            // Resource còn dư (không còn trong draft) -> xóa
                            if (!resourcesOfLesson.isEmpty()) {
                                lessonResourceRepository.deleteAllInBatch(resourcesOfLesson.values());
                            }
                        }
                    }

                    // ====== LESSON CÒN DƯ TRONG SECTION (KHÔNG CÒN TRONG DRAFT) ======
                    if (!lessonsOfSection.isEmpty()) {

                        // Lấy list lessonId bị xóa
                        List<Long> removedLessonIds = lessonsOfSection.values().stream()
                                .map(Lesson::getLessonID)
                                .toList();

                        // 1) Xóa tiến trình học UserLesson của các lesson này
                        if (!removedLessonIds.isEmpty()) {
                            userLessonRepository.deleteByLesson_LessonIDIn(removedLessonIds);
                        }

                        // 2) Xóa resource của các lesson này
                        List<LessonResource> resLeft = liveResources.stream()
                                .filter(r -> removedLessonIds.contains(r.getLesson().getLessonID()))
                                .toList();
                        if (!resLeft.isEmpty()) {
                            lessonResourceRepository.deleteAllInBatch(resLeft);
                        }

                        // 3) Xóa lesson
                        lessonRepository.deleteAllInBatch(lessonsOfSection.values());
                    }
                }
            }
        }

        // ====== SECTION CÒN DƯ (KHÔNG CÒN DRAFT THAM CHIẾU) ======
        if (!liveSectionMap.isEmpty()) {

            // Lấy list sectionId bị xóa
            List<Long> removedSectionIds = liveSectionMap.values().stream()
                    .map(CourseSection::getSectionID)
                    .toList();

            // 1) Xóa UserCourseSection cho những section này
            if (!removedSectionIds.isEmpty()) {
                userCourseSectionRepository.deleteBySection_SectionIDIn(removedSectionIds);
            }

            // 2) Với mỗi section còn dư => xóa lesson + resource + UserLesson
            for (CourseSection s : liveSectionMap.values()) {

                List<Lesson> ls = lessonRepository.findBySection_SectionIDIn(
                        List.of(s.getSectionID()));

                if (!ls.isEmpty()) {
                    List<Long> lIds = ls.stream().map(Lesson::getLessonID).toList();

                    // 2.1) Xóa UserLesson của các lesson này
                    if (!lIds.isEmpty()) {
                        userLessonRepository.deleteByLesson_LessonIDIn(lIds);
                    }

                    // 2.2) Xóa resources
                    List<LessonResource> rs = lIds.isEmpty()
                            ? List.of()
                            : lessonResourceRepository.findByLesson_LessonIDIn(lIds);
                    if (!rs.isEmpty()) {
                        lessonResourceRepository.deleteAllInBatch(rs);
                    }

                    // 2.3) Xóa lesson
                    lessonRepository.deleteAllInBatch(ls);
                }
            }

            // 3) Cuối cùng xóa section
            courseSectionRepository.deleteAllInBatch(liveSectionMap.values());
        }
    }

    // ====================== SYNC OBJECTIVES ======================

    private void syncObjectivesFromDraft(Course course, CourseDraft draft) {

        List<CourseObjective> liveObjectives =
                courseObjectiveRepository.findByCourse_CourseIDOrderByOrderIndexAsc(course.getCourseID());
        Map<Long, CourseObjective> liveObjectiveMap = liveObjectives.stream()
                .collect(Collectors.toMap(CourseObjective::getObjectiveID, o -> o));

        if (draft.getObjectives() != null) {
            for (CourseObjectiveDraft od : draft.getObjectives()) {
                if (od.getOriginalObjectiveID() != null
                        && liveObjectiveMap.containsKey(od.getOriginalObjectiveID())) {

                    CourseObjective o = liveObjectiveMap.get(od.getOriginalObjectiveID());
                    o.setObjectiveText(od.getObjectiveText());
                    o.setOrderIndex(od.getOrderIndex());

                    liveObjectiveMap.remove(od.getOriginalObjectiveID());
                } else {

                    CourseObjective o = CourseObjective.builder()
                            .course(course)
                            .objectiveText(od.getObjectiveText())
                            .orderIndex(od.getOrderIndex())
                            .build();
                    courseObjectiveRepository.save(o);
                }
            }
        }

        if (!liveObjectiveMap.isEmpty()) {
            courseObjectiveRepository.deleteAllInBatch(liveObjectiveMap.values());
        }
    }

    // ====================== DIFF HELPERS ======================

    // helper so sánh field
    private void compareField(List<FieldChangeResponse> list, String field, String oldVal, String newVal) {
        if (!Objects.equals(oldVal, newVal)) {
            list.add(FieldChangeResponse.builder()
                    .field(field)
                    .oldValue(oldVal)
                    .newValue(newVal)
                    .build());
        }
    }

    private List<FieldChangeResponse> buildCourseFieldChanges(Course course, CourseDraft draft) {
        List<FieldChangeResponse> changes = new ArrayList<>();

        compareField(changes, "title", course.getTitle(), draft.getTitle());
        compareField(changes, "shortDescription", course.getShortDescription(), draft.getShortDescription());
        compareField(changes, "description", course.getDescription(), draft.getDescription());
        compareField(changes, "requirement", course.getRequirement(), draft.getRequirement());
        compareField(changes, "level",
                course.getLevel() != null ? course.getLevel().name() : null,
                draft.getLevel() != null ? draft.getLevel().name() : null);
        compareField(changes, "duration",
                course.getDuration() != null ? course.getDuration().toString() : null,
                draft.getDuration() != null ? draft.getDuration().toString() : null);
        compareField(changes, "price",
                course.getPrice() != null ? course.getPrice().toPlainString() : null,
                draft.getPrice() != null ? draft.getPrice().toPlainString() : null);
        compareField(changes, "language", course.getLanguage(), draft.getLanguage());
        compareField(changes, "thumbnailURL", course.getThumbnailURL(), draft.getThumbnailURL());
        compareField(changes, "category",
                course.getCategory() != null ? course.getCategory().getName() : null,
                draft.getCategory() != null ? draft.getCategory().getName() : null);

        return changes;
    }

    private List<ObjectiveChangeResponse> buildObjectiveChanges(Course course, CourseDraft draft) {
        List<ObjectiveChangeResponse> result = new ArrayList<>();

        List<CourseObjective> liveObjectives =
                courseObjectiveRepository.findByCourse_CourseIDOrderByOrderIndexAsc(course.getCourseID());
        Map<Long, CourseObjective> liveMap = liveObjectives.stream()
                .collect(Collectors.toMap(CourseObjective::getObjectiveID, o -> o));

        if (draft.getObjectives() != null) {
            for (CourseObjectiveDraft od : draft.getObjectives()) {
                if (od.getOriginalObjectiveID() != null && liveMap.containsKey(od.getOriginalObjectiveID())) {
                    CourseObjective live = liveMap.get(od.getOriginalObjectiveID());
                    List<FieldChangeResponse> fields = new ArrayList<>();
                    compareField(fields, "objectiveText", live.getObjectiveText(), od.getObjectiveText());
                    compareField(fields, "orderIndex",
                            live.getOrderIndex() != null ? live.getOrderIndex().toString() : null,
                            od.getOrderIndex() != null ? od.getOrderIndex().toString() : null);

                    if (!fields.isEmpty()) {
                        result.add(ObjectiveChangeResponse.builder()
                                .originalObjectiveId(live.getObjectiveID())
                                .draftObjectiveId(od.getObjectiveDraftID())
                                .changeType("UPDATED")
                                .fieldChanges(fields)
                                .build());
                    }

                    liveMap.remove(od.getOriginalObjectiveID());
                } else {
                    // objective mới
                    List<FieldChangeResponse> fields = List.of(
                            FieldChangeResponse.builder()
                                    .field("objectiveText")
                                    .oldValue(null)
                                    .newValue(od.getObjectiveText())
                                    .build()
                    );
                    result.add(ObjectiveChangeResponse.builder()
                            .originalObjectiveId(null)
                            .draftObjectiveId(od.getObjectiveDraftID())
                            .changeType("ADDED")
                            .fieldChanges(fields)
                            .build());
                }
            }
        }

        // objective bị xóa
        for (CourseObjective o : liveMap.values()) {
            List<FieldChangeResponse> fields = List.of(
                    FieldChangeResponse.builder()
                            .field("objectiveText")
                            .oldValue(o.getObjectiveText())
                            .newValue(null)
                            .build()
            );
            result.add(ObjectiveChangeResponse.builder()
                    .originalObjectiveId(o.getObjectiveID())
                    .draftObjectiveId(null)
                    .changeType("DELETED")
                    .fieldChanges(fields)
                    .build());
        }

        return result;
    }

    private List<SectionChangeResponse> buildSectionChanges(Course course, CourseDraft draft) {
        List<SectionChangeResponse> result = new ArrayList<>();

        List<CourseSection> liveSections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        Map<Long, CourseSection> liveMap = liveSections.stream()
                .collect(Collectors.toMap(CourseSection::getSectionID, s -> s));

        if (draft.getSections() != null) {
            for (CourseSectionDraft sd : draft.getSections()) {
                if (sd.getOriginalSectionID() != null && liveMap.containsKey(sd.getOriginalSectionID())) {
                    CourseSection live = liveMap.get(sd.getOriginalSectionID());
                    List<FieldChangeResponse> fields = new ArrayList<>();
                    compareField(fields, "title", live.getTitle(), sd.getTitle());
                    compareField(fields, "description", live.getDescription(), sd.getDescription());
                    compareField(fields, "orderIndex",
                            live.getOrderIndex() != null ? live.getOrderIndex().toString() : null,
                            sd.getOrderIndex() != null ? sd.getOrderIndex().toString() : null);

                    if (!fields.isEmpty()) {
                        result.add(SectionChangeResponse.builder()
                                .originalSectionId(live.getSectionID())
                                .draftSectionId(sd.getSectionDraftID())
                                .title(sd.getTitle())
                                .changeType("UPDATED")
                                .fieldChanges(fields)
                                .build());
                    }

                    liveMap.remove(sd.getOriginalSectionID());
                } else {
                    // section mới
                    List<FieldChangeResponse> fields = List.of(
                            FieldChangeResponse.builder()
                                    .field("title")
                                    .oldValue(null)
                                    .newValue(sd.getTitle())
                                    .build()
                    );
                    result.add(SectionChangeResponse.builder()
                            .originalSectionId(null)
                            .draftSectionId(sd.getSectionDraftID())
                            .title(sd.getTitle())
                            .changeType("ADDED")
                            .fieldChanges(fields)
                            .build());
                }
            }
        }

        // section bị xóa
        for (CourseSection s : liveMap.values()) {
            List<FieldChangeResponse> fields = List.of(
                    FieldChangeResponse.builder()
                            .field("title")
                            .oldValue(s.getTitle())
                            .newValue(null)
                            .build()
            );
            result.add(SectionChangeResponse.builder()
                    .originalSectionId(s.getSectionID())
                    .draftSectionId(null)
                    .title(s.getTitle())
                    .changeType("DELETED")
                    .fieldChanges(fields)
                    .build());
        }

        return result;
    }

    private boolean isLessonChangeRequireResetProgress(Lesson live, LessonDraft draft) {
        if (live.getLessonType() == null) return false;
        String type = live.getLessonType().name();

        switch (type) {
            case "VIDEO" -> {
                return !Objects.equals(live.getVideoURL(), draft.getVideoURL());
            }
            case "READING" -> {
                return !Objects.equals(live.getContent(), draft.getContent());
            }
            default -> {
                return false;
            }
        }
    }

    private List<LessonChangeResponse> buildLessonChanges(Course course, CourseDraft draft) {
        List<LessonChangeResponse> result = new ArrayList<>();

        // Live lessons
        List<CourseSection> liveSections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        List<Lesson> liveLessons = liveSections.stream()
                .flatMap(s -> s.getLessons().stream())
                .toList();
        Map<Long, Lesson> liveById = liveLessons.stream()
                .collect(Collectors.toMap(Lesson::getLessonID, l -> l));

        // Draft lessons
        List<LessonDraft> draftLessons = draft.getSections() == null
                ? List.of()
                : draft.getSections().stream()
                .flatMap(sd -> sd.getLessons().stream())
                .toList();

        Map<Long, LessonDraft> draftByOriginalId = draftLessons.stream()
                .filter(ld -> ld.getOriginalLessonID() != null)
                .collect(Collectors.toMap(LessonDraft::getOriginalLessonID, ld -> ld));

        // Lesson bị xóa
        for (Lesson live : liveLessons) {
            if (!draftByOriginalId.containsKey(live.getLessonID())) {
                result.add(LessonChangeResponse.builder()
                        .originalLessonId(live.getLessonID())
                        .draftLessonId(null)
                        .title(live.getTitle())
                        .lessonType(live.getLessonType() != null ? live.getLessonType().name() : null)
                        .changeType("DELETED")
                        .fieldChanges(List.of())
                        .resetUserProgressRequired(true)
                        .build());
            }
        }

        // Lesson update
        for (LessonDraft ld : draftLessons) {
            if (ld.getOriginalLessonID() != null && liveById.containsKey(ld.getOriginalLessonID())) {
                Lesson live = liveById.get(ld.getOriginalLessonID());
                List<FieldChangeResponse> fields = new ArrayList<>();
                compareField(fields, "title", live.getTitle(), ld.getTitle());
                compareField(fields, "lessonType",
                        live.getLessonType() != null ? live.getLessonType().name() : null,
                        ld.getLessonType() != null ? ld.getLessonType().name() : null);
                compareField(fields, "duration",
                        live.getDuration() != null ? live.getDuration().toString() : null,
                        ld.getDuration() != null ? ld.getDuration().toString() : null);
                compareField(fields, "videoURL", live.getVideoURL(), ld.getVideoURL());
                compareField(fields, "content", live.getContent(), ld.getContent());
                compareField(fields, "orderIndex",
                        live.getOrderIndex() != null ? live.getOrderIndex().toString() : null,
                        ld.getOrderIndex() != null ? ld.getOrderIndex().toString() : null);

                boolean reset = isLessonChangeRequireResetProgress(live, ld);

                if (!fields.isEmpty()) {
                    result.add(LessonChangeResponse.builder()
                            .originalLessonId(live.getLessonID())
                            .draftLessonId(ld.getLessonDraftID())
                            .title(ld.getTitle())
                            .lessonType(ld.getLessonType() != null ? ld.getLessonType().name() : null)
                            .changeType("UPDATED")
                            .fieldChanges(fields)
                            .resetUserProgressRequired(reset)
                            .build());
                }
            }
        }

        // Lesson mới
        for (LessonDraft ld : draftLessons) {
            if (ld.getOriginalLessonID() == null) {
                List<FieldChangeResponse> fields = List.of(
                        FieldChangeResponse.builder()
                                .field("NEW_LESSON")
                                .oldValue(null)
                                .newValue(ld.getTitle())
                                .build()
                );
                result.add(LessonChangeResponse.builder()
                        .originalLessonId(null)
                        .draftLessonId(ld.getLessonDraftID())
                        .title(ld.getTitle())
                        .lessonType(ld.getLessonType() != null ? ld.getLessonType().name() : null)
                        .changeType("ADDED")
                        .fieldChanges(fields)
                        .resetUserProgressRequired(false)
                        .build());
            }
        }

        return result;
    }

    private List<ResourceChangeResponse> buildResourceChanges(Course course, CourseDraft draft) {
        List<ResourceChangeResponse> result = new ArrayList<>();

        // Live resources
        List<CourseSection> liveSections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        List<Lesson> liveLessons = liveSections.stream()
                .flatMap(s -> s.getLessons().stream())
                .toList();
        List<Long> lessonIds = liveLessons.stream().map(Lesson::getLessonID).toList();
        List<LessonResource> liveResources = lessonIds.isEmpty()
                ? List.of()
                : lessonResourceRepository.findByLesson_LessonIDIn(lessonIds);
        Map<Long, LessonResource> liveById = liveResources.stream()
                .collect(Collectors.toMap(LessonResource::getResourceID, r -> r));

        // Draft resources
        List<LessonResourceDraft> draftResources = draft.getSections() == null
                ? List.of()
                : draft.getSections().stream()
                .flatMap(sd -> sd.getLessons().stream())
                .flatMap(ld -> ld.getResources().stream())
                .toList();

        Map<Long, LessonResourceDraft> draftByOriginalId = draftResources.stream()
                .filter(rd -> rd.getOriginalResourceID() != null)
                .collect(Collectors.toMap(LessonResourceDraft::getOriginalResourceID, rd -> rd));

        // Resource bị xóa
        for (LessonResource live : liveResources) {
            if (!draftByOriginalId.containsKey(live.getResourceID())) {
                List<FieldChangeResponse> fields = List.of(
                        FieldChangeResponse.builder()
                                .field("resourceTitle")
                                .oldValue(live.getResourceTitle())
                                .newValue(null)
                                .build()
                );
                result.add(ResourceChangeResponse.builder()
                        .originalResourceId(live.getResourceID())
                        .draftResourceId(null)
                        .resourceTitle(live.getResourceTitle())
                        .changeType("DELETED")
                        .fieldChanges(fields)
                        .build());
            }
        }

        // Resource update
        for (LessonResourceDraft rd : draftResources) {
            if (rd.getOriginalResourceID() != null && liveById.containsKey(rd.getOriginalResourceID())) {
                LessonResource live = liveById.get(rd.getOriginalResourceID());
                List<FieldChangeResponse> fields = new ArrayList<>();
                compareField(fields, "resourceTitle", live.getResourceTitle(), rd.getResourceTitle());
                compareField(fields, "resourceType",
                        live.getResourceType() != null ? live.getResourceType().name() : null,
                        rd.getResourceType() != null ? rd.getResourceType().name() : null);
                compareField(fields, "resourceURL", live.getResourceURL(), rd.getResourceURL());

                if (!fields.isEmpty()) {
                    result.add(ResourceChangeResponse.builder()
                            .originalResourceId(live.getResourceID())
                            .draftResourceId(rd.getResourceDraftID())
                            .resourceTitle(rd.getResourceTitle())
                            .changeType("UPDATED")
                            .fieldChanges(fields)
                            .build());
                }
            }
        }

        // Resource mới
        for (LessonResourceDraft rd : draftResources) {
            if (rd.getOriginalResourceID() == null) {
                List<FieldChangeResponse> fields = List.of(
                        FieldChangeResponse.builder()
                                .field("NEW_RESOURCE")
                                .oldValue(null)
                                .newValue(rd.getResourceTitle())
                                .build()
                );
                result.add(ResourceChangeResponse.builder()
                        .originalResourceId(null)
                        .draftResourceId(rd.getResourceDraftID())
                        .resourceTitle(rd.getResourceTitle())
                        .changeType("ADDED")
                        .fieldChanges(fields)
                        .build());
            }
        }

        return result;
    }

    // tìm lesson cần reset progress khi approve draft
    private List<Long> findLessonIdsNeedResetProgress(Course course, CourseDraft draft) {
        List<Long> result = new ArrayList<>();

        List<CourseSection> liveSections = courseSectionRepository.findByCourse_CourseID(course.getCourseID());
        List<Lesson> liveLessons = liveSections.stream()
                .flatMap(s -> s.getLessons().stream())
                .toList();
        Map<Long, Lesson> liveById = liveLessons.stream()
                .collect(Collectors.toMap(Lesson::getLessonID, l -> l));

        List<LessonDraft> draftLessons = draft.getSections() == null
                ? List.of()
                : draft.getSections().stream()
                .flatMap(sd -> sd.getLessons().stream())
                .filter(ld -> ld.getOriginalLessonID() != null)
                .toList();

        for (LessonDraft ld : draftLessons) {
            Lesson live = liveById.get(ld.getOriginalLessonID());
            if (live == null) continue;
            if (isLessonChangeRequireResetProgress(live, ld)) {
                result.add(live.getLessonID());
            }
        }

        return result;
    }

    // ====================== BUILD DRAFT CHANGES (INTERNAL) ======================

    private AdminCourseDraftChangesResponse buildDraftChanges(Course course, CourseDraft draft) {
        List<FieldChangeResponse> courseChanges = buildCourseFieldChanges(course, draft);
        List<ObjectiveChangeResponse> objectiveChanges = buildObjectiveChanges(course, draft);
        List<SectionChangeResponse> sectionChanges = buildSectionChanges(course, draft);
        List<LessonChangeResponse> lessonChanges = buildLessonChanges(course, draft);
        List<ResourceChangeResponse> resourceChanges = buildResourceChanges(course, draft);

        return AdminCourseDraftChangesResponse.builder()
                .courseId(course.getCourseID())
                .draftId(draft.getDraftID())
                .courseChanges(courseChanges)
                .objectives(objectiveChanges)
                .sections(sectionChanges)
                .lessons(lessonChanges)
                .resources(resourceChanges)
                .build();
    }

    // ====================== PUBLIC: GET DIFF ======================

    @Transactional(readOnly = true)
    public AdminCourseDraftChangesResponse getCourseDraftChanges(Long draftID) {
        CourseDraft draft = courseDraftRepository.findById(draftID)
                .orElseThrow(() -> new AppException(ErrorCode.DRAFT_NOT_FOUND));

        Course course = draft.getCourse();
        return buildDraftChanges(course, draft);
    }

    // ====================== EMAIL HELPERS ======================

    private void notifyTutorCourseApproved(Course course, String note) {
        Tutor tutor = course.getTutor();
        if (tutor == null || tutor.getUser() == null) {
            return;
        }
        String email = tutor.getUser().getEmail();
        if (email == null || email.isBlank()) {
            return;
        }
        emailService.sendCourseApprovedToTutor(email, course.getTitle(), note);
    }

    private void notifyTutorCourseRejected(Course course, String note) {
        Tutor tutor = course.getTutor();
        if (tutor == null || tutor.getUser() == null) {
            return;
        }
        String email = tutor.getUser().getEmail();
        if (email == null || email.isBlank()) {
            return;
        }
        emailService.sendCourseRejectedToTutor(email, course.getTitle(), note);
    }

    private String buildCourseChangeSummary(AdminCourseDraftChangesResponse changes) {
        StringBuilder sb = new StringBuilder();

        if (changes.getCourseChanges() != null && !changes.getCourseChanges().isEmpty()) {
            sb.append("• Course info updated: ");
            sb.append(
                    changes.getCourseChanges().stream()
                            .map(FieldChangeResponse::getField)
                            .distinct()
                            .reduce((a, b) -> a + ", " + b)
                            .orElse("")
            );
            sb.append("\n");
        }

        if (changes.getObjectives() != null && !changes.getObjectives().isEmpty()) {
            long added = changes.getObjectives().stream().filter(o -> "ADDED".equals(o.getChangeType())).count();
            long updated = changes.getObjectives().stream().filter(o -> "UPDATED".equals(o.getChangeType())).count();
            long deleted = changes.getObjectives().stream().filter(o -> "DELETED".equals(o.getChangeType())).count();
            sb.append("• Objectives: +").append(added)
                    .append(", updated ").append(updated)
                    .append(", removed ").append(deleted).append("\n");
        }

        if (changes.getSections() != null && !changes.getSections().isEmpty()) {
            long added = changes.getSections().stream().filter(s -> "ADDED".equals(s.getChangeType())).count();
            long updated = changes.getSections().stream().filter(s -> "UPDATED".equals(s.getChangeType())).count();
            long deleted = changes.getSections().stream().filter(s -> "DELETED".equals(s.getChangeType())).count();
            sb.append("• Sections: +").append(added)
                    .append(", updated ").append(updated)
                    .append(", removed ").append(deleted).append("\n");
        }

        if (changes.getLessons() != null && !changes.getLessons().isEmpty()) {
            long added = changes.getLessons().stream().filter(l -> "ADDED".equals(l.getChangeType())).count();
            long updated = changes.getLessons().stream().filter(l -> "UPDATED".equals(l.getChangeType())).count();
            long deleted = changes.getLessons().stream().filter(l -> "DELETED".equals(l.getChangeType())).count();
            long reset = changes.getLessons().stream()
                    .filter(LessonChangeResponse::getResetUserProgressRequired)
                    .count();

            sb.append("• Lessons: +").append(added)
                    .append(", updated ").append(updated)
                    .append(", removed ").append(deleted).append("\n");

            if (reset > 0) {
                sb.append("  → Note: ").append(reset)
                        .append(" lesson(s) had major changes, your progress for those lessons was reset.\n");
            }
        }

        if (changes.getResources() != null && !changes.getResources().isEmpty()) {
            long added = changes.getResources().stream().filter(r -> "ADDED".equals(r.getChangeType())).count();
            long updated = changes.getResources().stream().filter(r -> "UPDATED".equals(r.getChangeType())).count();
            long deleted = changes.getResources().stream().filter(r -> "DELETED".equals(r.getChangeType())).count();
            sb.append("• Resources: +").append(added)
                    .append(", updated ").append(updated)
                    .append(", removed ").append(deleted).append("\n");
        }

        if (sb.length() == 0) {
            sb.append("Course was updated with minor internal changes.\n");
        }

        return sb.toString();
    }

    private void notifyLearnersCourseUpdated(Course course, AdminCourseDraftChangesResponse changes) {
        List<Enrollment> enrollments = enrollmentRepository.findAllByCourseId(course.getCourseID());
        if (enrollments == null || enrollments.isEmpty()) {
            return;
        }

        String summary = buildCourseChangeSummary(changes);

        Set<String> emails = new HashSet<>();
        for (Enrollment e : enrollments) {
            if (e.getUser() != null && e.getUser().getEmail() != null) {
                emails.add(e.getUser().getEmail());
            }
        }

        for (String email : emails) {
            emailService.sendCourseUpdatedToLearner(email, course.getTitle(), summary);
        }
    }
    private void notifyTutorCourseDraftApproved(CourseDraft draft, AdminCourseDraftChangesResponse changes) {
        Tutor tutor = draft.getTutor();
        if (tutor == null || tutor.getUser() == null) return;

        String email = tutor.getUser().getEmail();
        if (email == null || email.isBlank()) return;

        // Dùng lại logic build summary đã gửi cho learner
        String summary = buildCourseChangeSummary(changes);

        emailService.sendCourseDraftApprovedToTutor(
                email,
                draft.getCourse().getTitle(),
                summary
        );
    }

    private void notifyTutorCourseDraftRejected(CourseDraft draft, String note) {
        Tutor tutor = draft.getTutor();
        if (tutor == null || tutor.getUser() == null) return;
        String email = tutor.getUser().getEmail();
        if (email == null || email.isBlank()) return;

        emailService.sendCourseDraftRejectedToTutor(
                email,
                draft.getCourse().getTitle(),
                note
        );
    }


}

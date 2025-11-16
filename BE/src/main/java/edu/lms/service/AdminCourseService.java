// src/main/java/edu/lms/service/AdminCourseService.java
package edu.lms.service;

import edu.lms.dto.response.AdminCourseDraftResponse;
import edu.lms.dto.response.AdminCourseResponse;
import edu.lms.dto.response.AdminCourseDetailResponse;
import edu.lms.dto.response.CourseSectionResponse;
import edu.lms.dto.response.LessonResponse;
import edu.lms.dto.response.LessonResourceResponse;
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

    // NEW
    CourseObjectiveRepository courseObjectiveRepository;
    CourseObjectiveDraftRepository courseObjectiveDraftRepository;
    CourseDraftRepository courseDraftRepository;
    CourseSectionRepository courseSectionRepository;
    LessonRepository lessonRepository;
    LessonResourceRepository lessonResourceRepository;
    UserLessonRepository userLessonRepository;
    UserCourseSectionRepository userCourseSectionRepository;

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

        // 1. Update metadata từ draft → course live (KHÔNG ĐỤNG TỚI ID, STATUS)
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

        // 2. Sync curriculum (Section / Lesson / Resource)
        syncCurriculumFromDraft(course, draft);

        // 3. Sync objectives
        syncObjectivesFromDraft(course, draft);

        // 4. Xóa draft sau khi merge
        courseDraftRepository.delete(draft);

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
}

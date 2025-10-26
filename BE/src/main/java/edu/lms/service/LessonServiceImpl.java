package edu.lms.service;


import edu.lms.dto.request.LessonRequest;
import edu.lms.entity.*;
import edu.lms.enums.LessonType;
import edu.lms.exception.*;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.lms.dto.response.LessonResourceResponse;
import edu.lms.dto.response.LessonResponse;
import edu.lms.entity.Lesson;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final CourseSectionRepository sectionRepository;
    private final LessonResourceRepository resourceRepository;

    @Override
    public LessonResponse createLesson(Long sectionId, LessonRequest request, Long tutorId) {
        CourseSection section = sectionRepository.findBySectionIdAndTutorId(sectionId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseSection not found or you don't have permission"));

        Lesson lesson = Lesson.builder()
                .section(section)
                .title(request.getTitle())
                .duration(request.getDuration())
                .lessonType(request.getLessonType() != null ? request.getLessonType() : LessonType.Video)
                .videoURL(request.getVideoURL())
                .content(request.getContent())
                .orderIndex(request.getOrderIndex())
                .build();

        Lesson saved = lessonRepository.save(lesson);
        return mapToResponse(saved);
    }

    @Override
    public List<LessonResponse> getLessonsBySection(Long sectionId, Long tutorId) {
        CourseSection section = sectionRepository.findBySectionIdAndTutorId(sectionId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseSection not found or you don't have permission"));

        return lessonRepository.findBySectionSectionID(sectionId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getLessonsBySectionWithFilters(Long sectionId, Long tutorId, String keyword, String sortBy, String order) {
        CourseSection section = sectionRepository.findBySectionIdAndTutorId(sectionId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseSection not found or you don't have permission"));

        return lessonRepository.findBySectionWithFilters(sectionId, keyword, sortBy, order)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LessonResponse getLessonDetail(Long lessonId, Long tutorId) {
        Lesson lesson = lessonRepository.findByLessonIdAndTutorId(lessonId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found or you don't have permission"));

        return mapToResponse(lesson);
    }

    @Override
    public LessonResponse updateLesson(Long lessonId, LessonRequest request, Long tutorId) {
        Lesson lesson = lessonRepository.findByLessonIdAndTutorId(lessonId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found or you don't have permission"));

        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getDuration() != null) lesson.setDuration(request.getDuration());
        if (request.getLessonType() != null) lesson.setLessonType(request.getLessonType());
        if (request.getVideoURL() != null) lesson.setVideoURL(request.getVideoURL());
        if (request.getContent() != null) lesson.setContent(request.getContent());
        if (request.getOrderIndex() != null) lesson.setOrderIndex(request.getOrderIndex());

        Lesson updated = lessonRepository.save(lesson);
        return mapToResponse(updated);
    }

    @Override
    public void deleteLesson(Long lessonId, Long tutorId) {
        Lesson lesson = lessonRepository.findByLessonIdAndTutorId(lessonId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found or you don't have permission"));

        // Cascade remove handled by JPA
        lessonRepository.delete(lesson);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .lessonID(lesson.getLessonID())
                .title(lesson.getTitle())
                .duration(lesson.getDuration())
                .lessonType(lesson.getLessonType())
                .videoURL(lesson.getVideoURL())
                .content(lesson.getContent())
                .orderIndex(lesson.getOrderIndex())
                .createdAt(lesson.getCreatedAt())
                .resources(lesson.getResources() != null ?
                        lesson.getResources().stream().map(res ->
                                LessonResourceResponse.builder()
                                        .resourceID(res.getResourceID())
                                        .resourceType(res.getResourceType())
                                        .resourceTitle(res.getResourceTitle())
                                        .resourceURL(res.getResourceURL())
                                        .uploadedAt(res.getUploadedAt())
                                        .build()
                        ).collect(Collectors.toList()) : null)
                .build();
    }
}
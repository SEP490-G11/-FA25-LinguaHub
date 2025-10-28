package edu.lms.service;

import edu.lms.dto.request.LessonResourceRequest;
import edu.lms.dto.response.LessonResourceResponse;
import edu.lms.entity.*;
import edu.lms.enums.ResourceType;
import edu.lms.exception.*;
import edu.lms.security.UserPrincipal;
import edu.lms.repository.*;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LessonResourceServiceImpl implements LessonResourceService {

    private final LessonResourceRepository resourceRepository;
    private final LessonRepository lessonRepository;
    private final TutorRepository tutorRepository; // Thêm repo này

    private static final Pattern URL_PATTERN = Pattern.compile("^(http|https)://.*$", Pattern.CASE_INSENSITIVE);

    @Override
    public LessonResourceResponse addResource(Long lessonId, LessonResourceRequest request) {
        Long tutorId = getCurrentTutorId();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        // Kiểm tra quyền sở hữu
        if (!lesson.getSection().getCourse().getTutor().getTutorID().equals(tutorId)) {
            throw new AccessDeniedException("You are not allowed to add resources to this lesson");
        }

        validateURL(request.getResourceURL());

        LessonResource resource = LessonResource.builder()
                .lesson(lesson)
                .resourceType(request.getResourceType() != null ? request.getResourceType() : ResourceType.PDF)
                .resourceTitle(request.getResourceTitle())
                .resourceURL(request.getResourceURL())
                .build();

        LessonResource saved = resourceRepository.save(resource);
        return mapToResponse(saved);
    }

    @Override
    public List<LessonResourceResponse> getResourcesByLesson(Long lessonId) {
        Long tutorId = getCurrentTutorId();
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        // Kiểm tra quyền sở hữu
        if (!lesson.getSection().getCourse().getTutor().getTutorID().equals(tutorId)) {
            throw new AccessDeniedException("You are not allowed to view these resources");
        }

        return resourceRepository.findByLessonLessonID(lessonId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LessonResourceResponse updateResource(Long resourceId, LessonResourceRequest request) {
        Long tutorId = getCurrentTutorId();
        LessonResource resource = resourceRepository.findByResourceIdAndTutorId(resourceId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found or you don't have permission"));

        if (request.getResourceTitle() != null)
            resource.setResourceTitle(request.getResourceTitle());
        if (request.getResourceURL() != null) {
            validateURL(request.getResourceURL());
            resource.setResourceURL(request.getResourceURL());
        }
        if (request.getResourceType() != null)
            resource.setResourceType(request.getResourceType());

        LessonResource updated = resourceRepository.save(resource);
        return mapToResponse(updated);
    }

    @Override
    public void deleteResource(Long resourceId) {
        Long tutorId = getCurrentTutorId();
        LessonResource resource = resourceRepository.findByResourceIdAndTutorId(resourceId, tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found or you don't have permission"));

        resourceRepository.delete(resource);
    }

    private void validateURL(String url) {
        if (url == null || !URL_PATTERN.matcher(url).matches()) {
            throw new ValidationException("Invalid resource URL format");
        }
    }

    private LessonResourceResponse mapToResponse(LessonResource resource) {
        return LessonResourceResponse.builder()
                .resourceID(resource.getResourceID())
                .resourceType(resource.getResourceType())
                .resourceTitle(resource.getResourceTitle())
                .resourceURL(resource.getResourceURL())
                .uploadedAt(resource.getUploadedAt())
                .build();
    }

    // Helper method to get current tutor ID from security context
    private Long getCurrentTutorId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserPrincipal) {
            Long userId = ((UserPrincipal) principal).getUserId();
            return tutorRepository.findByUser_UserID(userId)
                    .map(Tutor::getTutorID)
                    .orElseThrow(() -> new AccessDeniedException("Current user is not a tutor"));
        }
        // Fallback or error for anonymous/unrecognized principals
        throw new AccessDeniedException("User not authenticated");
    }
}

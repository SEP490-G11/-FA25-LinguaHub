package edu.lms.service;

import edu.lms.dto.request.LessonResourceRequest;
import edu.lms.dto.response.LessonResourceResponse;

import java.util.List;

public interface LessonResourceService {
    LessonResourceResponse addResource(Long lessonId, LessonResourceRequest request, Long tutorId);

    List<LessonResourceResponse> getResourcesByLesson(Long lessonId, Long tutorId);

    LessonResourceResponse updateResource(Long resourceId, LessonResourceRequest request, Long tutorId);

    void deleteResource(Long resourceId, Long tutorId);
}

package edu.lms.service;


import edu.lms.dto.request.LessonRequest;
import edu.lms.dto.response.LessonResponse;

import java.util.List;

public interface LessonService {

    LessonResponse createLesson(Long sectionId, LessonRequest request, Long tutorId);

    List<LessonResponse> getLessonsBySection(Long sectionId, Long tutorId);

    List<LessonResponse> getLessonsBySectionWithFilters(Long sectionId, Long tutorId, String keyword, String sortBy, String order);

    LessonResponse getLessonDetail(Long lessonId, Long tutorId);

    LessonResponse updateLesson(Long lessonId, LessonRequest request, Long tutorId);

    void deleteLesson(Long lessonId, Long tutorId);
    
    Long getTutorIdBySection(Long sectionId);
    
    Long getTutorIdByLesson(Long lessonId);
}

package edu.lms.service;

import edu.lms.dto.request.CourseSectionRequest;
import edu.lms.dto.response.CourseSectionResponse;
import edu.lms.entity.Course;
import edu.lms.entity.CourseSection;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.CourseSectionMapper;
import edu.lms.repository.CourseRepository;
import edu.lms.repository.CourseSectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class CourseSectionService {

    CourseRepository courseRepository;
    CourseSectionRepository courseSectionRepository;
    CourseSectionMapper courseSectionMapper;

    public CourseSectionResponse createSection(CourseSectionRequest request) {
        Course course = courseRepository.findById(request.getCourseID())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        CourseSection section = courseSectionMapper.toEntity(request);
        section.setCourse(course);

        CourseSection saved = courseSectionRepository.save(section);
        return courseSectionMapper.toResponse(saved);
    }

    public List<CourseSectionResponse> getSectionsByCourse(Long courseID) {
        List<CourseSection> sections = courseSectionRepository.findByCourse_CourseID(courseID);
        return sections.stream()
                .map(courseSectionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public CourseSectionResponse getSectionById(Long sectionID) {
        CourseSection section = courseSectionRepository.findById(sectionID)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));
        return courseSectionMapper.toResponse(section);
    }

    public CourseSectionResponse updateSection(Long sectionID, CourseSectionRequest request) {
        CourseSection section = courseSectionRepository.findById(sectionID)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_KEY));

        // cập nhật thủ công các trường có thể sửa
        section.setTitle(request.getTitle());
        section.setDescription(request.getDescription());
        section.setOrderIndex(request.getOrderIndex());

        CourseSection updated = courseSectionRepository.save(section);
        return courseSectionMapper.toResponse(updated);
    }

    public void deleteSection(Long sectionID) {
        if (!courseSectionRepository.existsById(sectionID)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        courseSectionRepository.deleteById(sectionID);
    }
}

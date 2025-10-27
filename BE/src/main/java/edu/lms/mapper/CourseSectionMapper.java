package edu.lms.mapper;

import edu.lms.dto.request.CourseSectionRequest;
import edu.lms.dto.response.CourseSectionResponse;
import edu.lms.entity.CourseSection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseSectionMapper {

    // Request → Entity
    @Mapping(target = "sectionID", ignore = true)
    @Mapping(target = "course", ignore = true) // set thủ công trong service
    @Mapping(target = "lessons", ignore = true)
    CourseSection toEntity(CourseSectionRequest request);

    default CourseSectionResponse toResponse(CourseSection entity) {
        if (entity == null) {
            return null;
        }
        return CourseSectionResponse.builder()
                .sectionID(entity.getSectionID())
                .courseID(entity.getCourse() != null ? entity.getCourse().getCourseID() : null)
                .title(entity.getTitle())
                .description(entity.getDescription())
                .orderIndex(entity.getOrderIndex())
                .build();
    }
}

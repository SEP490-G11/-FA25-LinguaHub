package edu.lms.mapper;

import edu.lms.dto.request.TutorServiceRequest;
import edu.lms.dto.response.TutorServiceResponse;
import edu.lms.entity.Service;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TutorServiceMapper {
    TutorServiceMapper INSTANCE = Mappers.getMapper(TutorServiceMapper.class);

    Service toEntity(TutorServiceRequest request);
    TutorServiceResponse toResponse(Service service);
}

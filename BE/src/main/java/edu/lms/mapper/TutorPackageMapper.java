package edu.lms.mapper;

import edu.lms.dto.request.TutorPackageRequest;
import edu.lms.dto.response.TutorPackageResponse;
import edu.lms.entity.TutorPackage;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface TutorPackageMapper {

    @Mapping(target = "packageID", ignore = true)
    @Mapping(target = "maxSlots", source = "maxSlot")
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "price", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TutorPackage toEntity(TutorPackageRequest request);

    @Mapping(target = "packageId", source = "packageID")
    @Mapping(target = "tutorId", source = "tutor.tutorID")
    @Mapping(target = "maxSlot", source = "maxSlots")
    @Mapping(target = "active", source = "isActive")
    TutorPackageResponse toResponse(TutorPackage tutorPackage);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "maxSlots", source = "maxSlot")
    @Mapping(target = "tutor", ignore = true)
    @Mapping(target = "price", ignore = true)
    @Mapping(target = "packageID", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(TutorPackageRequest request, @MappingTarget TutorPackage tutorPackage);
}



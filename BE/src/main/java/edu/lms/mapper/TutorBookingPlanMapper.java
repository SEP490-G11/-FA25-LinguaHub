package edu.lms.mapper;

import edu.lms.dto.request.TutorBookingPlanRequest;
import edu.lms.dto.response.TutorBookingPlanResponse;
import edu.lms.entity.BookingPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TutorBookingPlanMapper {

    /**
     * Map từ Request sang Entity
     */
    @Mapping(target = "bookingPlanID", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "isOpen", constant = "true")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BookingPlan toEntity(TutorBookingPlanRequest request);

    /**
     * Map từ Entity sang Response
     */
    @Mapping(target = "numberOfGeneratedSlots", ignore = true)
    TutorBookingPlanResponse toResponse(BookingPlan bookingPlan);
}

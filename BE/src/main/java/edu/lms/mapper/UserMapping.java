package edu.lms.mapper;

import edu.lms.dto.request.UserCreationRequest;
import edu.lms.dto.request.UserUpdateRequest;
import edu.lms.dto.response.UserResponse;
import edu.lms.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface UserMapping {
    User toUser(UserCreationRequest request);
//    @Mapping(source = "firstName", target = "lastName", ignore = true)
    UserResponse toUserResponse(User user);
    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}

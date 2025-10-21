package edu.lms.mapper;

import edu.lms.dto.request.UserCreationRequest;
import edu.lms.dto.response.UserResponse;
import edu.lms.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface UserMapping {

    User toUser(UserCreationRequest request);

    @Mapping(target = "userID", expression = "java(mapUUID(user.getUserID()))") // ✅ Custom mapping
    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().getName() : null)")
    UserResponse toUserResponse(User user);

    //MapStruct sẽ gọi hàm này để map UUID
    default UUID mapUUID(UUID value) {
        return value;
    }
}

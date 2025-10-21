package edu.lms.service;


import edu.lms.constant.PredefinedRole;
import edu.lms.dto.request.UserCreationRequest;
import edu.lms.dto.request.UserUpdateRequest;
import edu.lms.dto.response.UserResponse;
import edu.lms.entity.User;
import edu.lms.entity.Role;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.mapper.UserMapping;
import edu.lms.repository.RoleRepository;
import edu.lms.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapping userMapping;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;

    public UserResponse createUser(UserCreationRequest request) {
        User user = userMapping.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role defaultRole = roleRepository.findById("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));


        Set<Role> roles = new HashSet<>();
        roles.add(defaultRole);
        user.setRoles(roles);


        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }


        return userMapping.toUserResponse(user);
    }


    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapping::toUserResponse).toList();
    }

//    @PostAuthorize("hasRole(ADMIN)")//Lấy user theo id
//    public UserResponse getUser(String id) {
//        log.info("In method get User by Id");
//        return userMapping.toUserResponse(userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found")));
//    }
//
//    public UserResponse getMyInfo() {//lấy in4 thg user có token tương ứng
//        var context = SecurityContextHolder.getContext();
//        String name = context.getAuthentication().getName();
//        User user = userRepository.findByUsername(name)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        return userMapping.toUserResponse(user);
//    }

//    @PostAuthorize("returnObject.username == authentication.name")
//    public UserResponse updateUser(String userId, UserUpdateRequest request) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//        userMapping.updateUser(user, request);
//        user.setPassword(passwordEncoder.encode(user.getPassword()));
//
//        var roles = roleRepository.findAllById(request.getRoles());
//        user.setRoles(new HashSet<>(roles));
//
//        return userMapping.toUserResponse(userRepository.save(user));
//
//    }
//public UserResponse updateUserFields(String userID, Map<String, Object> updates) {
//    User user = userRepository.findById(userID).orElseThrow(() -> new RuntimeException("User not found"));
//    updates.forEach((field, value) -> {
//        switch (field) {
//            case "firstName" -> user.setFirstName((String) value);
//            case "lastName" -> user.setLastName((String) value);
//            case "dob" -> user.setDob(LocalDate.parse((String) value));
//            case "username" -> user.setUsername((String) value);
//            // bạn có thể thêm các field khác cần update
//            default -> throw new RuntimeException("Field " + field + " not updatable");
//        }
//    });

//    userRepository.save(user);
//    return userMapping.toUserResponse(user);
//}
//
//    @PreAuthorize("hasAuthority('DELETE_USER')")
//    public void deleteUser(String userId) {
//        userRepository.deleteById(userId);
//    }

}

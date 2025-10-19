package edu.lms.controller;


import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.UserCreationRequest;
import edu.lms.dto.request.UserUpdateRequest;
import edu.lms.dto.response.UserResponse;
import edu.lms.entity.User;
import edu.lms.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/users") // Controller quản lý user
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Builder
public class UserController {


    UserService userService;


    @PostMapping
        // POST /identity/users
    ApiRespond<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiRespond.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    ApiRespond<List<UserResponse>> getUsers() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("UserName : {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        return ApiRespond.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }


    @GetMapping("/myInfo") // GET /identity/users/{id}
    public ApiRespond<UserResponse> getMyInfo() {
        return ApiRespond.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

//    @PutMapping("/{userID}") // PUT /identity/users/{id}
//    public UserResponse updateUser(@PathVariable String userID, @RequestBody UserUpdateRequest request) {
//        return userService.updateUser(userID, request);
//    }
@PatchMapping("/{userID}")
public ResponseEntity<UserResponse> updateUserFields(
        @PathVariable String userID,
        @RequestBody Map<String, Object> updates) {
    UserResponse updatedUser = userService.updateUserFields(userID, updates);
    return ResponseEntity.ok(updatedUser);
}


    @DeleteMapping("/{userID}") // DELETE /identity/users/{id}
    public void deleteUser(@PathVariable String userID) {
        userService.deleteUser(userID);
    }
}


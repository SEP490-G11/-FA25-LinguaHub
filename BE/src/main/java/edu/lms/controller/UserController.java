package edu.lms.controller;

import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.UserCreationRequest;
import edu.lms.dto.response.UserResponse;
import edu.lms.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_USER')")
    ApiRespond<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiRespond.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_USER')")
    ApiRespond<List<UserResponse>> getUsers() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User: {}", auth.getName());
        auth.getAuthorities().forEach(a -> log.info("Authority: {}", a.getAuthority()));

        return ApiRespond.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @GetMapping("/myInfo")
    @PreAuthorize("hasAuthority('VIEW_USER')")
    public ApiRespond<UserResponse> getMyInfo() {
        return ApiRespond.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PatchMapping("/{userID}")
    @PreAuthorize("hasAuthority('UPDATE_USER') or hasAuthority('ADMIN')")
    public ResponseEntity<UserResponse> updateUserFields(
            @PathVariable UUID userID,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(userService.updateUserFields(userID, updates));
    }

    @DeleteMapping("/{userID}")
    @PreAuthorize("hasAuthority('DELETE_USER')")
    public void deleteUser(@PathVariable UUID userID) {
        userService.deleteUser(userID);
    }
}

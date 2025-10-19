package edu.lms.controller;


import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.PermissionRequest;
import edu.lms.dto.response.PermissionResponse;
import edu.lms.service.PermissionService;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/permissions") // Controller quản lý user
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Builder
public class PermissionController {
    PermissionService permissionService;

    @PostMapping
    ApiRespond<PermissionResponse> create(@RequestBody PermissionRequest permissionRequest){
        return ApiRespond.<PermissionResponse>builder()
                .result(permissionService.create(permissionRequest))
                .build();

    }
    @GetMapping
    ApiRespond<List<PermissionResponse>> getAll(){
        return ApiRespond.<List<PermissionResponse>>builder()
                .result(permissionService.getAll())
                .build();

    }
    @DeleteMapping("/{permission}")
    ApiRespond<Void> delete(@PathVariable String permission){
        permissionService.delete(permission);
        return ApiRespond.<Void>builder().build();
    }
}

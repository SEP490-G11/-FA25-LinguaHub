package edu.lms.controller;


import edu.lms.dto.request.ApiRespond;
import edu.lms.dto.request.RoleRequest;
import edu.lms.dto.response.RoleResponse;
import edu.lms.service.RoleService;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Builder
public class RoleController {
    RoleService roleService;

    @PostMapping
    ApiRespond<RoleResponse> create(@RequestBody RoleRequest request){
        return ApiRespond.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();

    }
    @GetMapping
    ApiRespond<List<RoleResponse>> getAll(){
        return ApiRespond.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();

    }
    @DeleteMapping("/{role}")
    ApiRespond<Void> delete(@PathVariable String role){
        roleService.delete(role);
        return ApiRespond.<Void>builder().build();
    }
    @PutMapping("/{roleName}")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable String roleName,
            @RequestBody RoleRequest request) {
        return ResponseEntity.ok(roleService.update(roleName, request));
    }

}

package edu.lms.service;


import edu.lms.dto.request.PermissionRequest;
import edu.lms.dto.response.PermissionResponse;
import edu.lms.entity.Permission;
import edu.lms.mapper.PermissionMapper;
import edu.lms.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest permissionRequest){
        Permission permission = permissionMapper.toPermission(permissionRequest);
        permission =  permissionRepository.save(permission);
        PermissionResponse permissionResponse = permissionMapper.toPermissionResponse(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll(){
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }


    public void delete(String permission){
        permissionRepository.deleteById(permission);
    }

}

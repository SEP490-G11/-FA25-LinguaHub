package edu.lms.configuration;

import edu.lms.entity.Permission;
import edu.lms.entity.Role;
import edu.lms.repository.PermissionRepository;
import edu.lms.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initData() {

        Role admin = roleRepository.findById("Admin").orElseGet(() ->
                roleRepository.save(Role.builder()
                        .name("Admin")
                        .description("System administrator - Full access")
                        .permissions(new HashSet<>())
                        .build())
        );

        Role tutor = roleRepository.findById("Tutor").orElseGet(() ->
                roleRepository.save(Role.builder()
                        .name("Tutor")
                        .description("Course creator / Instructor")
                        .permissions(new HashSet<>())
                        .build())
        );

        Role learner = roleRepository.findById("Learner").orElseGet(() ->
                roleRepository.save(Role.builder()
                        .name("Learner")
                        .description("Regular student user")
                        .permissions(new HashSet<>())
                        .build())
        );


        List<Permission> defaultPermissions = List.of(

                // --- USER MANAGEMENT ---
                new Permission("CREATE_USER", "Create new users"),
                new Permission("VIEW_USER", "View user list"),
                new Permission("UPDATE_USER", "Update user info"),
                new Permission("DELETE_USER", "Delete users"),

                // --- ROLE MANAGEMENT ---
                new Permission("CREATE_ROLE", "Create new roles"),
                new Permission("VIEW_ROLE", "View all roles"),
                new Permission("UPDATE_ROLE", "Update existing role"),
                new Permission("DELETE_ROLE", "Delete a role"),

                // --- PERMISSION MANAGEMENT ---
                new Permission("CREATE_PERMISSION", "Create new permissions"),
                new Permission("VIEW_PERMISSION", "View permission list"),
                new Permission("DELETE_PERMISSION", "Delete permissions"),

                // --- AUTHENTICATION / SECURITY ---
                new Permission("LOGIN", "Login to the system"),
                new Permission("LOGOUT", "Logout from the system"),
                new Permission("INTROSPECT_TOKEN", "Check token validity"),

                // --- COURSE / SYSTEM FEATURES ---
                new Permission("MANAGE_COURSES", "Manage all courses"),
                new Permission("VIEW_REPORTS", "View system reports"),
                new Permission("APPLY_TUTOR", "Apply to become a tutor")
        );


        for (Permission p : defaultPermissions) {
            if (!permissionRepository.existsById(p.getName())) {
                permissionRepository.save(p);
            }
        }


        // Admin – Toàn quyền
        admin.getPermissions().addAll(permissionRepository.findAll());

        // Tutor – có thể xem user, quản lý khóa học, chỉnh sửa thông tin cá nhân
        tutor.getPermissions().add(permissionRepository.findById("VIEW_USER").orElseThrow());
        tutor.getPermissions().add(permissionRepository.findById("UPDATE_USER").orElseThrow());
        tutor.getPermissions().add(permissionRepository.findById("MANAGE_COURSES").orElseThrow());
        tutor.getPermissions().add(permissionRepository.findById("VIEW_ROLE").orElseThrow());
        tutor.getPermissions().add(permissionRepository.findById("VIEW_PERMISSION").orElseThrow());

        //Learner – chỉ được xem thông tin bản thân, apply tutor, enroll course
        learner.getPermissions().add(permissionRepository.findById("VIEW_USER").orElseThrow());
        learner.getPermissions().add(permissionRepository.findById("APPLY_TUTOR").orElseThrow());
        learner.getPermissions().add(permissionRepository.findById("LOGIN").orElseThrow());
        learner.getPermissions().add(permissionRepository.findById("LOGOUT").orElseThrow());


        roleRepository.saveAll(List.of(admin, tutor, learner));

        System.out.println("✅ Roles & Permissions have been initialized successfully!");
    }
}

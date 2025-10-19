package edu.lms.repository;

import edu.lms.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository  extends JpaRepository<Role,String> {
}

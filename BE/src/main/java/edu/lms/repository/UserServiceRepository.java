package edu.lms.repository;

import edu.lms.entity.UserService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserServiceRepository extends JpaRepository<UserService, Long> {
    boolean existsByService_ServiceID(Long serviceID);
}

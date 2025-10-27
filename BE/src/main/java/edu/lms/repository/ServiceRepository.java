package edu.lms.repository;

import edu.lms.entity.Service;
import edu.lms.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByTutor(Tutor tutor);
}

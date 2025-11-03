package edu.lms.repository;

import edu.lms.entity.BookingPlan;
import edu.lms.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingPlanRepository extends JpaRepository<BookingPlan, Long> {
    List<BookingPlan> findByTutor(Tutor tutor);
}

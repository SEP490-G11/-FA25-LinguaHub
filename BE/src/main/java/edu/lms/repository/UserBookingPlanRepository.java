package edu.lms.repository;

import edu.lms.entity.UserBookingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBookingPlanRepository extends JpaRepository<UserBookingPlan, Long> {
    boolean existsByBookingPlan_BookingPlanID(Long bookingPlanID);
}

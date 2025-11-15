package edu.lms.repository;

import edu.lms.entity.BookingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingPlanRepository extends JpaRepository<BookingPlan, Long> {
    
    /**
     * Tìm tất cả booking plan của một tutor
     */
    List<BookingPlan> findByTutorID(Long tutorID);

    /**
     * Tìm booking plan theo tutorID và title (thứ trong tuần)
     */
    List<BookingPlan> findByTutorIDAndTitle(Long tutorID, String title);

    /**
     * Kiểm tra xem có booking plan nào overlap với thời gian cho trước không
     * (cùng tutor, cùng title/ngày, và thời gian overlap)
     */
    @Query("""
        SELECT bp FROM BookingPlan bp
        WHERE bp.tutorID = :tutorID
          AND bp.date = :date
          AND bp.isActive = true
          AND (:excludeId IS NULL OR bp.bookingPlanID <> :excludeId)
          AND NOT (bp.endTime <= :startTime OR bp.startTime >= :endTime)
        """)
    List<BookingPlan> findOverlappingPlans(
            @Param("tutorID") Long tutorID,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );

    List<BookingPlan> findByTutorIDAndIsActiveTrueOrderByDateAscStartTimeAsc(Long tutorID);

    List<BookingPlan> findByTutorIDAndIsActiveTrueAndDateOrderByStartTimeAsc(Long tutorID, LocalDate date);
}

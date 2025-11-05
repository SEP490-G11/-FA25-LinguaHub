package edu.lms.repository;

import edu.lms.entity.BookingPlanSlot;
import edu.lms.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingPlanSlotRepository extends JpaRepository<BookingPlanSlot, Long> {

    boolean existsByTutorIDAndStartTimeAndEndTime(Long tutorID, LocalDateTime startTime, LocalDateTime endTime);

    List<BookingPlanSlot> findAllByPaymentID(Long paymentId);

    List<BookingPlanSlot> findAllByUserIDAndPaymentIDAndStatus(Long userId, Long paymentId, SlotStatus status);

    @Modifying
    @Query("""
        UPDATE BookingPlanSlot s
        SET s.paymentID = :paymentId
        WHERE s.userID = :userId
          AND s.tutorID = :tutorId
          AND s.status = 'Locked'
          AND s.paymentID IS NULL
    """)
    void updatePaymentForUserLockedSlots(
            @Param("userId") Long userId,
            @Param("tutorId") Long tutorId,
            @Param("paymentId") Long paymentId
    );

    @Query("""
        SELECT s FROM BookingPlanSlot s
        WHERE s.status = 'Locked'
          AND s.expiresAt < :now
    """)
    List<BookingPlanSlot> findAllExpiredSlots(@Param("now") LocalDateTime now);
}

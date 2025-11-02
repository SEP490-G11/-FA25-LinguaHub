package edu.lms.repository;

import edu.lms.entity.Schedule;
import edu.lms.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByTutor(Tutor tutor);

    List<Schedule> findByTutor_TutorID(Long tutorID);

    @Query("SELECT s FROM Schedule s WHERE s.tutor.tutorID = :tutorID " +
            "AND s.startTime >= :startTime AND s.startTime <= :endTime " +
            "ORDER BY s.startTime ASC")
    List<Schedule> findByTutorAndTimeRange(
            @Param("tutorID") Long tutorID,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT s FROM Schedule s WHERE s.tutor.tutorID = :tutorID " +
            "AND ((s.startTime < :endTime AND s.endTime > :startTime))")
    List<Schedule> findOverlappingSchedules(
            @Param("tutorID") Long tutorID,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT s FROM Schedule s WHERE s.tutor.tutorID = :tutorID " +
            "AND s.startTime = :startTime")
    List<Schedule> findByTutorAndStartTime(
            @Param("tutorID") Long tutorID,
            @Param("startTime") LocalDateTime startTime
    );
}


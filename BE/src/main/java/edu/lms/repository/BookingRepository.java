package edu.lms.repository;

import edu.lms.entity.Tutor;
import edu.lms.entity.User;
import edu.lms.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByTutor(Tutor tutor);
    List<Booking> findByUserAndTutor(User user, Tutor tutor);
    List<Booking> findByUserAndTutorAndStatus(User user, Tutor tutor, BookingStatus status);
    Optional<Booking> findByBookingID(Long bookingID);
    boolean existsByUserAndTutorAndStatus(User user, Tutor tutor, BookingStatus status);
}



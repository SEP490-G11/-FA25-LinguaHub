package edu.lms.service;

import edu.lms.dto.response.CourseResponse;
import edu.lms.entity.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@Transactional
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class WishlistService {

    WishlistRepository wishlistRepository;
    UserRepository userRepository;
    CourseRepository courseRepository;

    public void addToWishlist(String email, Long courseId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        wishlistRepository.findByUserAndCourse(user, course)
                .ifPresent(w -> { throw new AppException(ErrorCode.ALREADY_IN_WISHLIST); });

        wishlistRepository.save(Wishlist.builder().user(user).course(course).build());
    }

    public void removeFromWishlist(String email, Long courseId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        wishlistRepository.deleteByUserAndCourse(user, course);
    }

    public List<CourseResponse> getMyWishlist(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return wishlistRepository.findByUser(user).stream()
                .map(w -> toCourseResponse(w.getCourse()))
                .toList();
    }

    private CourseResponse toCourseResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getCourseID())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .language(course.getLanguage())
                .thumbnailURL(course.getThumbnailURL())
                .categoryName(course.getCategory().getName())
                .tutorName(course.getTutor().getUser().getFullName())
                .status(course.getStatus().name())
                .build();
    }
}

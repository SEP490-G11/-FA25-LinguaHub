package edu.lms.service;

import edu.lms.dto.request.CourseReviewRequest;
import edu.lms.dto.response.CourseReviewResponse;
import edu.lms.entity.*;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class CourseReviewService {

    CourseReviewRepository courseReviewRepository;
    UserRepository userRepository;
    CourseRepository courseRepository;
    EnrollmentRepository enrollmentRepository;
    TutorRepository tutorRepository;
    UserCourseSectionRepository userCourseSectionRepository;


    @Transactional
    public CourseReviewResponse createReview(Long courseId, CourseReviewRequest request) {
        // Lấy user từ JWT token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra course tồn tại
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // Kiểm tra learner có enroll khóa học chưa
        Enrollment enrollment = enrollmentRepository
                .findByUser_UserIDAndCourse_CourseID(user.getUserID(), courseId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_ENROLLED));

        // Tính progress trung bình từ UserCourseSection
        List<UserCourseSection> sectionProgressList = userCourseSectionRepository
                .findByUser_UserIDAndSection_Course_CourseID(user.getUserID(), courseId);

        double avgProgress = sectionProgressList.isEmpty()
                ? 0.0
                : sectionProgressList.stream()
                .mapToDouble(s -> s.getProgress().doubleValue())
                .average()
                .orElse(0.0);

        // Yêu cầu hoàn thành ít nhất 50%
        if (avgProgress < 50.0) {
            throw new AppException(ErrorCode.COURSE_NOT_COMPLETED_HALF);
        }

        // Kiểm tra đã review chưa
        boolean alreadyReviewed = courseReviewRepository
                .findByCourse_CourseIDAndUser_UserID(courseId, user.getUserID())
                .isPresent();

        if (alreadyReviewed) {
            throw new AppException(ErrorCode.ALREADY_REVIEWED);
        }

        // Tạo review
        CourseReview review = CourseReview.builder()
                .course(course)
                .user(user)
                .comment(request.getComment())
                .rating(request.getRating())
                .createdAt(LocalDateTime.now())
                .build();

        courseReviewRepository.save(review);

        // Cập nhật lại rating trung bình của Tutor
        updateTutorRating(course.getTutor());

        return CourseReviewResponse.builder()
                .feedbackID(review.getReviewID())
                .userFullName(user.getFullName())
                .userAvatarURL(user.getAvatarURL())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    // DELETE REVIEW

    @Transactional
    public void deleteReview(Long reviewId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        CourseReview review = courseReviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        if (!review.getUser().getUserID().equals(user.getUserID())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Tutor tutor = review.getCourse().getTutor();
        courseReviewRepository.delete(review);
        updateTutorRating(tutor);
    }


    //TÍNH LẠI RATING TRUNG BÌNH CỦA TUTOR

    private void updateTutorRating(Tutor tutor) {
        if (tutor == null) return;
        List<Course> tutorCourses = courseRepository.findAll().stream()
                .filter(c -> c.getTutor() != null && c.getTutor().getTutorID().equals(tutor.getTutorID()))
                .toList();

        // Gom tất cả review của các course đó
        List<CourseReview> tutorReviews = tutorCourses.stream()
                .flatMap(c -> courseReviewRepository.findByCourse_CourseID(c.getCourseID()).stream())
                .toList();

        double avgRating = tutorReviews.isEmpty()
                ? 0.0
                : tutorReviews.stream()
                .mapToDouble(CourseReview::getRating)
                .average()
                .orElse(0.0);

        tutor.setRating(BigDecimal.valueOf(avgRating));
        tutorRepository.save(tutor);
    }
}

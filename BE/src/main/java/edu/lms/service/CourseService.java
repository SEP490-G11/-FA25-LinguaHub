package edu.lms.service;

import edu.lms.dto.response.*;
import edu.lms.entity.*;
import edu.lms.enums.CourseStatus;
import edu.lms.enums.EnrollmentStatus;
import edu.lms.exception.AppException;
import edu.lms.exception.ErrorCode;
import edu.lms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TutorRepository tutorRepository;
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FeedbackRepository feedbackRepository;



    //Public
    public List<CourseResponse> getAllApproved(String email) {
        User user = (email != null) ? userRepository.findByEmail(email).orElse(null) : null;

        return courseRepository.findByStatus(CourseStatus.Approved)
                .stream()
                .map(c -> toOnlyCourseResponse(c, user))
                .toList();
    }


    public List<CourseResponse> getApprovedByTutor(Long tutorId, String email) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new AppException(ErrorCode.TUTOR_NOT_FOUND));

        User user = (email != null) ? userRepository.findByEmail(email).orElse(null) : null;

        return courseRepository.findByTutorAndStatus(tutor, CourseStatus.Approved)
                .stream()
                .map(c -> toOnlyCourseResponse(c, user))
                .toList();
    }

    public CourseDetailResponse getCourseById(Long courseID, String email) {
        Course c = courseRepository.findById(courseID)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        User user = (email != null) ? userRepository.findByEmail(email).orElse(null) : null;

        return toCourseResponse(c, user);
    }

    public List<CourseDetailResponse> getAllByStatus(CourseStatus status) {
        List<Course> courses = (status == null)
                ? courseRepository.findAll()
                : courseRepository.findByStatus(status);
        return courses.stream().map(c -> toCourseResponse(c, null)).toList();
    }

    // MAPPERS

    private LessonResourceResponse toLessonResourceResponse(LessonResource lr) {
        return LessonResourceResponse.builder()
                .resourceID(lr.getResourceID())
                .resourceType(lr.getResourceType())
                .resourceTitle(lr.getResourceTitle())
                .resourceURL(lr.getResourceURL())
                .uploadedAt(lr.getUploadedAt())
                .build();
    }

    private LessonResponse toLessonResponse(Lesson l) {
        return LessonResponse.builder()
                .lessonID(l.getLessonID())
                .title(l.getTitle())
                .duration(l.getDuration())
                .lessonType(l.getLessonType())
                .videoURL(l.getVideoURL())
                .content(l.getContent())
                .orderIndex(l.getOrderIndex())
                .createdAt(l.getCreatedAt())
                .resources(
                        l.getResources() != null
                                ? l.getResources().stream().map(this::toLessonResourceResponse).toList()
                                : null
                )
                .build();
    }

    private CourseSectionResponse toCourseSectionResponse(CourseSection s) {
        return CourseSectionResponse.builder()
                .sectionID(s.getSectionID())
                .courseID(s.getCourse().getCourseID())
                .title(s.getTitle())
                .description(s.getDescription())
                .orderIndex(s.getOrderIndex())
                .lessons(
                        s.getLessons() != null
                                ? s.getLessons().stream().map(this::toLessonResponse).toList()
                                : null
                )
                .build();
    }

    //(LEARNER, RATING, FEEDBACK)

    private record RatingAgg(double avg, int total) {}

    private RatingAgg aggregateRating(Long courseId) {
        var feedbacks = feedbackRepository.findByPayment_Enrollment_Course_CourseID(courseId);
        if (feedbacks == null || feedbacks.isEmpty()) return new RatingAgg(0.0, 0);
        int total = feedbacks.size();
        int sum = feedbacks.stream().mapToInt(f -> f.getRating() == null ? 0 : f.getRating()).sum();
        double avg = total == 0 ? 0.0 : (double) sum / total;
        avg = Math.round(avg * 10.0) / 10.0; // làm tròn 1 chữ số
        return new RatingAgg(avg, total);
    }

    private List<FeedbackResponse> mapFeedbacks(Long courseId) {
        var feedbacks = feedbackRepository.findByPayment_Enrollment_Course_CourseID(courseId);
        if (feedbacks == null || feedbacks.isEmpty()) return List.of();
        return feedbacks.stream().map(f -> {
            var u = f.getUser();
            var p = f.getPayment();
            return FeedbackResponse.builder()
                    .feedbackID(f.getFeedbackID())
                    .userFullName(u != null ? u.getFullName() : null)
                    .userAvatarURL(u != null ? u.getAvatarURL() : null)
                    .rating(f.getRating())
                    .comment(f.getComment())
                    .createdAt(p != null ? p.getPaidAt() : null)
                    .build();
        }).toList();
    }

    // COURSE -> DETAIL DTO

    private CourseDetailResponse toCourseResponse(Course c, User user) {
        boolean isWishListed = (user != null) && wishlistRepository.existsByUserAndCourse(user, c);

        boolean isPurchased = false;
        if (user != null) {
            var enrollmentOpt = enrollmentRepository
                    .findByUser_UserIDAndCourse_CourseID(user.getUserID(), c.getCourseID());
            if (enrollmentOpt.isPresent()) {
                var st = enrollmentOpt.get().getStatus();
                isPurchased = (st == EnrollmentStatus.Active || st == EnrollmentStatus.Completed);
            }
        }

        Long courseId = c.getCourseID();
        long learnerCount = enrollmentRepository.countByCourse_CourseID(courseId);
        var rating = aggregateRating(courseId);
        var tutorUser = (c.getTutor() != null) ? c.getTutor().getUser() : null;

        return CourseDetailResponse.builder()
                .id(courseId)
                .title(c.getTitle())
                .description(c.getDescription())
                .duration(c.getDuration())
                .price(c.getPrice())
                .language(c.getLanguage())
                .thumbnailURL(c.getThumbnailURL())
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .tutorName(tutorUser != null ? tutorUser.getFullName() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .section(
                        c.getSections() != null
                                ? c.getSections().stream().map(this::toCourseSectionResponse).toList()
                                : null
                )
                .isWishListed(user != null ? isWishListed : null)
                .isPurchased(user != null ? isPurchased : null)

                // thống kê + tutor info
                .learnerCount(learnerCount)
                .tutorAvatarURL(tutorUser != null ? tutorUser.getAvatarURL() : null)
                .tutorAddress(tutorUser != null
                        ? ((tutorUser.getAddress() != null && tutorUser.getCountry() != null)
                        ? tutorUser.getAddress() + ", " + tutorUser.getCountry()
                        : (tutorUser.getAddress() != null ? tutorUser.getAddress() : tutorUser.getCountry()))
                        : null)
                .avgRating(rating.avg())
                .totalRatings(rating.total())
                .createdAt(c.getCreatedAt())

                // Feedback cho trang detail
                .feedbacks(mapFeedbacks(courseId))
                .build();
    }

    // COURSE -> LIST DTO

    private CourseResponse toOnlyCourseResponse(Course c, User user) {
        boolean isWishListed = (user != null) && wishlistRepository.existsByUserAndCourse(user, c);

        boolean isPurchased = false;
        if (user != null) {
            var enrollmentOpt = enrollmentRepository
                    .findByUser_UserIDAndCourse_CourseID(user.getUserID(), c.getCourseID());
            if (enrollmentOpt.isPresent()) {
                var st = enrollmentOpt.get().getStatus();
                isPurchased = (st == EnrollmentStatus.Active || st == EnrollmentStatus.Completed);
            }
        }

        Long courseId = c.getCourseID();
        long learnerCount = enrollmentRepository.countByCourse_CourseID(courseId);
        var rating = aggregateRating(courseId);
        var tutorUser = (c.getTutor() != null) ? c.getTutor().getUser() : null;

        return CourseResponse.builder()
                .id(courseId)
                .title(c.getTitle())
                .description(c.getDescription())
                .duration(c.getDuration())
                .price(c.getPrice())
                .language(c.getLanguage())
                .thumbnailURL(c.getThumbnailURL())
                .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
                .tutorName(tutorUser != null ? tutorUser.getFullName() : null)
                .status(c.getStatus() != null ? c.getStatus().name() : null)
                .isWishListed(user != null ? isWishListed : null)
                .isPurchased(user != null ? isPurchased : null)

                //thống kê + tutor info cho list
                .learnerCount(learnerCount)
                .tutorAvatarURL(tutorUser != null ? tutorUser.getAvatarURL() : null)
                .tutorAddress(tutorUser != null
                        ? ((tutorUser.getAddress() != null && tutorUser.getCountry() != null)
                        ? tutorUser.getAddress() + ", " + tutorUser.getCountry()
                        : (tutorUser.getAddress() != null ? tutorUser.getAddress() : tutorUser.getCountry()))
                        : null)
                .avgRating(rating.avg())
                .totalRatings(rating.total())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

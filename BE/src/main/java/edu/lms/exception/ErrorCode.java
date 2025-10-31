package edu.lms.exception;


import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999,"Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001,"Invalid key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Username is Existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004,"Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXIST(1005,"User is not exist", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006,"UNAUTHENTICATED YET", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007,"You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008,"Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1009,"Your role is not found" , HttpStatus.NOT_FOUND ),
    INVALID_OTP(2001, "Invalid or incorrect OTP code", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(2002, "OTP code has expired", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(2003,"Password is not matched" , HttpStatus.BAD_REQUEST),
    PASSWORD_ENABLED(2004,"The password is false", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(2005,"This Email has Signed in before", HttpStatus.BAD_REQUEST),
    COURSE_NOT_FOUND(3001, "Course not found", HttpStatus.NOT_FOUND),
    COURSE_HAS_ENROLLMENT(3002, "Cannot modify or delete a course that already has enrolled learners", HttpStatus.CONFLICT),
    COURSE_CATEGORY_NOT_FOUND(3003, "Course category not found", HttpStatus.NOT_FOUND),
    COURSE_ALREADY_EXISTS(3004, "Course with the same title already exists", HttpStatus.BAD_REQUEST),
    //  TUTOR MODULE
    TUTOR_NOT_FOUND(4001, "Tutor not found", HttpStatus.NOT_FOUND),
    TUTOR_NOT_APPROVED(4002, "Tutor is not approved yet", HttpStatus.FORBIDDEN),
    TUTOR_APPLICATION_PENDING(4003, "Tutor application is still pending", HttpStatus.BAD_REQUEST),
    TUTOR_APPLICATION_NOT_FOUND(4004, "Tutor application not found", HttpStatus.NOT_FOUND),

    //  ENROLLMENT & LEARNER MODULE
    ENROLLMENT_NOT_FOUND(5001, "Enrollment not found", HttpStatus.NOT_FOUND),
    ENROLLMENT_ALREADY_EXISTS(5002, "User already enrolled in this course", HttpStatus.CONFLICT),

    //  PAYMENT & TRANSACTION
    PAYMENT_NOT_FOUND(6001, "Payment not found", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED(6002, "Payment transaction failed", HttpStatus.BAD_REQUEST),
    REFUND_NOT_ALLOWED(6003, "Refund not allowed for this transaction", HttpStatus.FORBIDDEN),

    // BOOKING_PLAN & BOOKING
    BOOKING_PLAN_NOT_FOUND(7001, "BookingPlan not found", HttpStatus.NOT_FOUND),
    BOOKING_NOT_FOUND(7002, "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CONFIRMED(7003, "Booking is already confirmed", HttpStatus.BAD_REQUEST),
    BOOKING_TIME_CONFLICT(7004, "Tutor schedule conflict at this time", HttpStatus.CONFLICT),

    //  CHAT & POLICY
    CHAT_ROOM_NOT_FOUND(8001, "Chat room not found", HttpStatus.NOT_FOUND),
    POLICY_NOT_FOUND(8002, "Policy not found", HttpStatus.NOT_FOUND),

    //PAYMENT
    INVALID_PAYMENT_TYPE(8003, "Ivalid Payment Type", HttpStatus.NOT_FOUND),;


    ErrorCode(int code, String message,HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.statusCode=httpStatusCode;
    }

    private int code;
    private String message;
    private HttpStatusCode statusCode;

}

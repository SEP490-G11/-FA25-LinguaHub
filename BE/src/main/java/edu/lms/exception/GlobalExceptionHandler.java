package edu.lms.exception;

import edu.lms.dto.request.ApiRespond;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.Objects;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


    private static final String MIN_ATTRIBUTE = "min";
    // Lỗi custom do mình ném ra
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiRespond> handleAppException(AppException ex) {
        ErrorCode errorcode = ex.getErrorcode();
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(errorcode.getCode());
        apiRespond.setMessage(errorcode.getMessage());
        return ResponseEntity
                .status(errorcode.getStatusCode())
                .body(apiRespond);
    }

    // Lỗi validation (ví dụ @NotBlank, @Size…)
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiRespond> handleValidation(MethodArgumentNotValidException ex) {
        String enumKey = ex.getFieldError().getDefaultMessage();
        ErrorCode errorcode = ErrorCode.INVALID_KEY;
        Map<String,Object> attributes = null;
        try {
            errorcode = ErrorCode.valueOf(enumKey);


            var contrainViolations = ex.getBindingResult()
                    .getFieldErrors()
                    .getFirst()
                    .unwrap(ConstraintViolation.class);
            attributes = contrainViolations.getConstraintDescriptor().getAttributes();
            log.info(attributes.toString());


        } catch (IllegalArgumentException e) {
            // nếu không map được enum thì để mặc định
        }
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(errorcode.getCode());
        apiRespond.setMessage(Objects.nonNull(attributes) ?
                mapAttribuite(errorcode.getMessage(), attributes) : errorcode.getMessage());
        return ResponseEntity.badRequest().body(apiRespond);
    }

    // Lỗi parse JSON sai
    @ExceptionHandler(value = HttpMessageNotReadableException.class)
    public ResponseEntity<ApiRespond> handleJsonParse(HttpMessageNotReadableException ex) {
        ex.printStackTrace(); // log chi tiết
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(ErrorCode.INVALID_KEY.getCode());
        apiRespond.setMessage("Invalid JSON format");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiRespond);
    }

    // RuntimeException chung
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<ApiRespond> handleRuntimeException(RuntimeException ex) {
        ex.printStackTrace(); // log để thấy lỗi thực tế
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        // có thể tạm thời để ex.getMessage() trong lúc dev cho dễ debug
        apiRespond.setMessage(ex.getMessage() != null
                ? ex.getMessage()
                : ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiRespond);
    }


    @ExceptionHandler(value = AuthorizationDeniedException.class)
    public ResponseEntity<ApiRespond> handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ErrorCode errorcode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorcode.getStatusCode()).body(
                ApiRespond.builder()
                        .code(errorcode.getCode())
                        .message(errorcode.getMessage())
                        .build());
    }

    // Handle EntityNotFoundException
    @ExceptionHandler(value = EntityNotFoundException.class)
    public ResponseEntity<ApiRespond> handleEntityNotFound(EntityNotFoundException ex) {
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(404);
        apiRespond.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiRespond);
    }

    // Handle TutorApplicationException
    @ExceptionHandler(value = TutorApplicationException.class)
    public ResponseEntity<ApiRespond> handleTutorApplication(TutorApplicationException ex) {
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(400);
        apiRespond.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiRespond);
    }

    // Handle TutorNotFoundException
    @ExceptionHandler(value = TutorNotFoundException.class)
    public ResponseEntity<ApiRespond> handleTutorNotFound(TutorNotFoundException ex) {
        ApiRespond apiRespond = new ApiRespond();
        apiRespond.setCode(404);
        apiRespond.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiRespond);
    }
    private String mapAttribuite(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE).toString());
        return message.replace("{"+ MIN_ATTRIBUTE + "}", minValue);
    }
}

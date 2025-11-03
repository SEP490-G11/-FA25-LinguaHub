package edu.lms.dto.request;

import lombok.Data;

@Data
public class LessonProgressRequest {
    private Boolean isDone;          // true nếu học xong
    private Integer watchedDuration; // thời lượng đã xem (giây)
}

package edu.lms.dto.request;

import lombok.Data;

@Data
public class VerifyEmailRequest {
    private String otp;
}

package edu.lms.service;

import edu.lms.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[LinguaHub] Verify your email");
        message.setText("Your verification code is: " + otp + "\nThis code will expire in 5 minutes.");
        mailSender.send(message);
    }

    public void notifyAdminNewTutor(User tutor) {
        log.info("New tutor waiting for approval: {}", tutor.getEmail());
        // Optional: gửi mail thông báo cho admin
    }
}

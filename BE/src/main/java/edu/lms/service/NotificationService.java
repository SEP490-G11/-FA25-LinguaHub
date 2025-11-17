package edu.lms.service;

import edu.lms.entity.Notification;
import edu.lms.enums.NotificationType;
import edu.lms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void send(Long userId, String title, String content, NotificationType type, String url) {
        Notification n = Notification.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .type(type)
                .primaryActionUrl(url)
                .build();

        notificationRepository.save(n);
    }
}

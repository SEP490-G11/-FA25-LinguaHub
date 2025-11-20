package edu.lms.controller;

import edu.lms.entity.Notification;
import edu.lms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ================================
    // GET ALL NOTIFICATIONS (ADMIN)
    // ================================
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        List<Notification> notifications = notificationService.getAll();
        return ResponseEntity.ok(notifications);
    }

    // ==============================================
    // GET NOTIFICATIONS BY USER ID (ADMIN / FE)
    // ==============================/================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationByUserId(userId);
        return ResponseEntity.ok(notifications);
    }
}

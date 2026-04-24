package com.edulearn.discnotif.resource;

import com.edulearn.discnotif.entity.Notification;
import com.edulearn.discnotif.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing user notifications and alerts")
public class NotificationResource {

    private final NotificationService notificationService;

    @PostMapping("/send")
    @Operation(summary = "Send a single notification")
    public ResponseEntity<Void> sendNotification(@RequestBody Notification notification) {
        notificationService.sendNotification(notification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk")
    @Operation(summary = "Send notifications to multiple users (Admin)")
    public ResponseEntity<Void> sendBulkNotification(@RequestParam List<Integer> userIds, @RequestParam String title, @RequestParam String message) {
        notificationService.sendBulkNotification(userIds, title, message);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all notifications for a user")
    public ResponseEntity<List<Notification>> getByUser(@PathVariable int userId) {
        return ResponseEntity.ok(notificationService.getByUser(userId));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable int id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/{userId}/readAll")
    @Operation(summary = "Mark all notifications as read for a user")
    public ResponseEntity<Void> markAllRead(@PathVariable int userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/count")
    @Operation(summary = "Get unread notification count for a user")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable int userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable int id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}

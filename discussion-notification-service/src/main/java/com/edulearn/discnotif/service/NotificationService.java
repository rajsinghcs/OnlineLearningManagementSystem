package com.edulearn.discnotif.service;

import com.edulearn.discnotif.entity.Notification;

import java.util.List;

public interface NotificationService {
    void sendNotification(Notification notification);
    void sendBulkNotification(List<Integer> userIds, String title, String message, String type);
    void markAsRead(int notificationId);
    void markAllRead(int userId);
    List<Notification> getByUser(int userId);
    int getUnreadCount(int userId);
    void deleteNotification(int notificationId);
    void sendEmailAlert(String toEmail, String subject, String body);
}

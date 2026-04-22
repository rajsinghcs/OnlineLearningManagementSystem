package com.edulearn.discnotif.serviceimpl;

import com.edulearn.discnotif.entity.Notification;
import com.edulearn.discnotif.exception.NotificationNotFoundException;
import com.edulearn.discnotif.repository.NotificationRepository;
import com.edulearn.discnotif.service.NotificationService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Override
    public void sendNotification(Notification notification) {
        notificationRepository.save(notification);
    }

    @Override
    public void sendBulkNotification(List<Integer> userIds, String title, String message) {
        for (Integer userId : userIds) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type("SYSTEM")
                    .build();
            sendNotification(notification);
        }
    }

    @Override
    public void markAsRead(int notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllRead(int userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsRead(userId, false);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public List<Notification> getByUser(int userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public int getUnreadCount(int userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Override
    public void deleteNotification(int notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public void sendEmailAlert(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlContent = "<div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;'>" +
                    "<h2 style='color: #4CAF50;'>EduLearn LMS</h2>" +
                    "<h3>" + subject + "</h3>" +
                    "<p>" + body + "</p>" +
                    "<hr>" +
                    "<p style='font-size: 12px; color: #777;'>This is an automated message from EduLearn. Please do not reply.</p>" +
                    "</div>";

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("support@edulearn.com");

            mailSender.send(message);
            log.info("Email alert sent successfully to {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send email alert to {}", toEmail, e);
        }
    }
}

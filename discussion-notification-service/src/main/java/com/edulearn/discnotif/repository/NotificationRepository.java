package com.edulearn.discnotif.repository;

import com.edulearn.discnotif.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(int userId);

    List<Notification> findByUserIdAndIsRead(int userId, boolean isRead);

    int countByUserIdAndIsRead(int userId, boolean isRead);

    List<Notification> findByType(String type);

    List<Notification> findByRelatedEntityId(int entityId);

    void deleteByNotificationId(int notificationId);
}

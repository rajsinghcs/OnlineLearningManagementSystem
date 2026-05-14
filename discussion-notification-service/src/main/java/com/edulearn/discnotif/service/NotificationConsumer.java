package com.edulearn.discnotif.service;

import com.edulearn.discnotif.config.RabbitMQConfig;
import com.edulearn.discnotif.dto.NotificationDTO;
import com.edulearn.discnotif.entity.Notification;
import com.edulearn.discnotif.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consumeNotification(NotificationDTO notificationDTO) {
        log.info("Consumed notification message from RabbitMQ: {}", notificationDTO);
        
        Notification notification = Notification.builder()
                .userId(notificationDTO.getUserId())
                .type(notificationDTO.getType())
                .title(notificationDTO.getTitle())
                .message(notificationDTO.getMessage())
                .relatedEntityId(notificationDTO.getRelatedEntityId())
                .relatedEntityType(notificationDTO.getRelatedEntityType())
                .build();
        
        notificationRepository.save(notification);
        log.info("Saved notification for user: {}", notificationDTO.getUserId());
    }
}

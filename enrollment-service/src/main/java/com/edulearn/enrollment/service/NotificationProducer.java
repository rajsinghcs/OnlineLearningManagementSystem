package com.edulearn.enrollment.service;

import com.edulearn.enrollment.config.RabbitMQConfig;
import com.edulearn.enrollment.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(NotificationDTO notificationDTO) {
        log.info("Sending notification message to RabbitMQ: {}", notificationDTO);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
                notificationDTO
        );
    }
}

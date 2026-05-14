package com.edulearn.progress.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private int userId;
    private String type;
    private String title;
    private String message;
    private int relatedEntityId;
    private String relatedEntityType;
}

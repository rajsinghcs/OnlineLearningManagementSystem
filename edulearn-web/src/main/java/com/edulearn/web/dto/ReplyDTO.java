package com.edulearn.web.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReplyDTO {
    private int replyId;
    private int threadId;
    private int authorId;
    private String authorName;
    private String body;
    private boolean isAccepted;
    private int upvotes;
    private LocalDateTime createdAt;
}

package com.edulearn.discnotif.dto;

import java.util.List;

public class BulkNotificationRequest {
    private List<Integer> userIds;
    private String title;
    private String message;
    private String type;

    public BulkNotificationRequest() {}

    public BulkNotificationRequest(List<Integer> userIds, String title, String message, String type) {
        this.userIds = userIds;
        this.title = title;
        this.message = message;
        this.type = type;
    }

    public List<Integer> getUserIds() { return userIds; }
    public void setUserIds(List<Integer> userIds) { this.userIds = userIds; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}

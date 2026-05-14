package com.edulearn.auth.service;

public interface MailService {
    void sendVerificationEmail(String to, String token);
    void sendResetPasswordEmail(String to, String token);
    void sendApprovalNotification(String to);
}

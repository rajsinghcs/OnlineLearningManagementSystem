package com.edulearn.auth.serviceimpl;

import com.edulearn.auth.service.MailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async
    public void sendVerificationEmail(String to, String token) {
        String subject = "Verify your email - EduLearn";
        String verificationUrl = "http://localhost:8765/api/auth/verify-email?token=" + token;
        String content = "<h1>Email Verification</h1>"
                + "<p>Thank you for registering. Please click the link below to verify your email:</p>"
                + "<a href=\"" + verificationUrl + "\">Verify Email</a>"
                + "<p>If you did not register, please ignore this email.</p>";

        sendEmail(to, subject, content);
    }
    @Override
    @Async
    public void sendResetPasswordEmail(String to, String token) {
        String subject = "Reset your password - EduLearn";
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String content = "<h1>Password Reset Request</h1>"
                + "<p>You have requested to reset your password. Please click the link below to set a new password:</p>"
                + "<a href=\"" + resetUrl + "\">Reset Password</a>"
                + "<p>This link will expire in 1 hour.</p>"
                + "<p>If you did not request a password reset, please ignore this email.</p>";

        sendEmail(to, subject, content);
    }

    @Override
    @Async
    public void sendApprovalNotification(String to) {
        String subject = "Instructor Account Approved - EduLearn";
        String content = "<h1>Congratulations!</h1>"
                + "<p>Your instructor account has been approved by the admin. You can now login and start creating courses.</p>";

        sendEmail(to, subject, content);
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail); // Use the configured Gmail address
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            System.out.println("MAIL_DEBUG: Sending email to " + to);
            mailSender.send(message);
            System.out.println("MAIL_DEBUG: Email successfully sent to " + to);
        } catch (Exception e) {
            System.err.println("MAIL_DEBUG: Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}

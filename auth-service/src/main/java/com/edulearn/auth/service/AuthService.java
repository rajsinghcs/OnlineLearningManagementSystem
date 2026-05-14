package com.edulearn.auth.service;

import com.edulearn.auth.entity.User;

public interface AuthService {

    User register(User user);

    String login(String email, String password);

    void logout(String token);

    boolean validateToken(String token);

    String refreshToken(String token);

    User getUserByEmail(String email);

    void changePassword(int userId, String newPassword);

    User updateProfile(int userId, User user);

    String oauth2Login(String email, String fullName, String provider, String profilePicUrl);

    void suspendUser(int userId);

    void unsuspendUser(int userId);

    void verifyEmail(String token);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void approveInstructor(int instructorId);

    java.util.List<User> getPendingInstructors();
}

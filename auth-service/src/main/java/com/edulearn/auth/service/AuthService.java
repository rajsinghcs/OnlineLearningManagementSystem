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
}

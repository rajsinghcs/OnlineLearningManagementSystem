package com.edulearn.web.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private int userId;
    private String fullName;
    private String email;
    private String password; // Added for login/register
    private String role;
    private String bio;
    private String profilePicUrl;
    private boolean isActive;
}

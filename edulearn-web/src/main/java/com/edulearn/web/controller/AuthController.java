package com.edulearn.web.controller;

import com.edulearn.web.dto.UserDTO;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authUrl;

    @GetMapping("/login")
    public String loginPage(Model model) {
        model.addAttribute("user", new UserDTO());
        return "auth/login";
    }

    @PostMapping("/login")
    public String login(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session,
            Model model) {

        try {
            Map<String, String> credentials = new HashMap<>();
            credentials.put("email", email);
            credentials.put("password", password);

            ResponseEntity<String> response =
                restTemplate.postForEntity(
                    authUrl + "/auth/login",
                    credentials,
                    String.class);

            String jwtToken = response.getBody();
            session.setAttribute("jwtToken", jwtToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(jwtToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<UserDTO> userResponse =
                restTemplate.exchange(
                    authUrl + "/auth/profile/me",
                    HttpMethod.GET,
                    entity,
                    UserDTO.class);

            UserDTO currentUser = userResponse.getBody();
            session.setAttribute("currentUser", currentUser);
            session.setAttribute("userRole", currentUser.getRole());

            return "redirect:/dashboard";

        } catch (Exception e) {
            model.addAttribute("error", "Invalid email or password");
            return "auth/login";
        }
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("user", new UserDTO());
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(
            @ModelAttribute UserDTO userDTO,
            @RequestParam String role,
            Model model) {

        try {
            Map<String, String> userData = new HashMap<>();
            userData.put("fullName", userDTO.getFullName());
            userData.put("email", userDTO.getEmail());
            userData.put("password", userDTO.getPassword());
            userData.put("role", role);

            restTemplate.postForEntity(
                authUrl + "/auth/register",
                userData,
                Object.class);

            return "redirect:/auth/login?registered=true";

        } catch (Exception e) {
            model.addAttribute("error", "Email already exists or registration failed");
            return "auth/register";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        String token = (String) session.getAttribute("jwtToken");
        if (token != null) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(token);
                restTemplate.exchange(
                    authUrl + "/auth/logout",
                    HttpMethod.POST,
                    new HttpEntity<>(headers),
                    String.class);
            } catch (Exception ignored) {}
        }
        session.invalidate();
        return "redirect:/auth/login";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session) {
        String role = (String) session.getAttribute("userRole");
        if (role == null)
            return "redirect:/auth/login";
        return switch (role) {
            case "STUDENT"    -> "redirect:/student/dashboard";
            case "INSTRUCTOR" -> "redirect:/instructor/dashboard";
            case "ADMIN"      -> "redirect:/admin/dashboard";
            default -> "redirect:/auth/login";
        };
    }
}

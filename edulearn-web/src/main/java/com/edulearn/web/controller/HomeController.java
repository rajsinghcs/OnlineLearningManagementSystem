package com.edulearn.web.controller;

import com.edulearn.web.dto.CourseDTO;
import com.edulearn.web.dto.CertificateDTO;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.client.RestTemplate;

@Controller
public class HomeController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${course.service.url}")
    private String courseUrl;

    @Value("${progress.service.url}")
    private String progressUrl;

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        try {
            ResponseEntity<CourseDTO[]> featured =
                restTemplate.getForEntity(
                    courseUrl + "/courses/featured",
                    CourseDTO[].class);
            model.addAttribute("featuredCourses", featured.getBody());
        } catch (Exception e) {
            model.addAttribute("featuredCourses", new CourseDTO[0]);
        }
        return "home";
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

    @GetMapping("/certificates/verify/{code}")
    public String verifyCertificate(
            @PathVariable String code,
            Model model) {
        try {
            ResponseEntity<CertificateDTO> cert =
                restTemplate.getForEntity(
                    progressUrl + "/certificates/verify/" + code,
                    CertificateDTO.class);
            model.addAttribute("certificate", cert.getBody());
            model.addAttribute("valid", true);
        } catch (Exception e) {
            model.addAttribute("valid", false);
            model.addAttribute("message", "Certificate not found or invalid");
        }
        return "public/verify-certificate";
    }
}

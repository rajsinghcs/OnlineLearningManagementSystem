package com.edulearn.web.controller;

import com.edulearn.web.dto.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authUrl;

    @Value("${course.service.url}")
    private String courseUrl;

    @Value("${enrollment.service.url}")
    private String enrollmentUrl;

    @Value("${payment.service.url}")
    private String paymentUrl;

    @Value("${progress.service.url}")
    private String progressUrl;

    @Value("${discnotif.service.url}")
    private String discnotifUrl;

    private HttpEntity<?> authHeaders(HttpSession session) {
        String token = (String) session.getAttribute("jwtToken");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        try {
            ResponseEntity<com.edulearn.web.dto.PaymentDTO[]> payments =
                restTemplate.exchange(
                    paymentUrl + "/payments/all",
                    HttpMethod.GET,
                    authHeaders(session),
                    com.edulearn.web.dto.PaymentDTO[].class);
            
            double totalRev = 0.0;
            if (payments.getBody() != null) {
                for (com.edulearn.web.dto.PaymentDTO p : payments.getBody()) {
                    if ("SUCCESS".equalsIgnoreCase(p.getStatus())) {
                        totalRev += p.getAmount();
                    }
                }
            }
            model.addAttribute("totalRevenue", totalRev);
        } catch (Exception e) { model.addAttribute("totalRevenue", 0.0); }

        try {
            ResponseEntity<com.edulearn.web.dto.UserDTO[]> users =
                restTemplate.exchange(
                    authUrl + "/auth/users?role=STUDENT",
                    HttpMethod.GET,
                    authHeaders(session),
                    com.edulearn.web.dto.UserDTO[].class);
            model.addAttribute("totalStudents", users.getBody() != null ? users.getBody().length : 0);
        } catch (Exception e) { model.addAttribute("totalStudents", 0); }

        try {
            ResponseEntity<CourseDTO[]> allCourses =
                restTemplate.exchange(
                    courseUrl + "/courses/all",
                    HttpMethod.GET,
                    authHeaders(session),
                    CourseDTO[].class);
            model.addAttribute("totalCourses", allCourses.getBody() != null ? allCourses.getBody().length : 0);
        } catch (Exception e) { model.addAttribute("totalCourses", 0); }

        try {
            ResponseEntity<CertificateDTO[]> certs =
                restTemplate.exchange(
                    progressUrl + "/certificates/all",
                    HttpMethod.GET,
                    authHeaders(session),
                    CertificateDTO[].class);
            model.addAttribute("totalCerts", certs.getBody() != null ? certs.getBody().length : 0);
        } catch (Exception e) { model.addAttribute("totalCerts", 0); }

        model.addAttribute("user", session.getAttribute("currentUser"));

        return "admin/dashboard";
    }

    @GetMapping("/users")
    public String manageUsers(
            @RequestParam(required = false) String role,
            HttpSession session,
            Model model) {

        String url = authUrl + "/auth/users";
        if (role != null && !role.isEmpty()) {
            url += "?role=" + role;
        }

        ResponseEntity<UserDTO[]> users =
            restTemplate.exchange(
                url,
                HttpMethod.GET,
                authHeaders(session),
                UserDTO[].class);

        model.addAttribute("users", users.getBody());
        model.addAttribute("selectedRole", role);

        return "admin/users";
    }

    @PostMapping("/users/{userId}/suspend")
    public String suspendUser(
            @PathVariable int userId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            authUrl + "/auth/users/" + userId + "/suspend",
            HttpMethod.PUT,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/admin/users?suspended=true";
    }

    @PostMapping("/users/{userId}/delete")
    public String deleteUser(
            @PathVariable int userId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            authUrl + "/auth/delete/" + userId,
            HttpMethod.DELETE,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/admin/users?deleted=true";
    }

    @GetMapping("/courses")
    public String manageCourses(HttpSession session, Model model) {
        ResponseEntity<CourseDTO[]> courses =
            restTemplate.exchange(
                courseUrl + "/courses/all",
                HttpMethod.GET,
                authHeaders(session),
                CourseDTO[].class);

        model.addAttribute("courses", courses.getBody());
        return "admin/courses-review";
    }

    @PostMapping("/courses/{courseId}/approve")
    public String approveCourse(
            @PathVariable int courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            courseUrl + "/courses/" + courseId + "/approve",
            HttpMethod.PUT,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/admin/courses?approved=true";
    }

    @PostMapping("/courses/{courseId}/reject")
    public String rejectCourse(
            @PathVariable int courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            courseUrl + "/courses/" + courseId + "/reject",
            HttpMethod.PUT,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/admin/courses?rejected=true";
    }

    @GetMapping("/payments")
    public String viewPayments(HttpSession session, Model model) {
        ResponseEntity<PaymentDTO[]> payments =
            restTemplate.exchange(
                paymentUrl + "/payments/all",
                HttpMethod.GET,
                authHeaders(session),
                PaymentDTO[].class);

        ResponseEntity<Double> revenue =
            restTemplate.exchange(
                paymentUrl + "/payments/revenue",
                HttpMethod.GET,
                authHeaders(session),
                Double.class);

        model.addAttribute("payments", payments.getBody());
        model.addAttribute("totalRevenue", revenue.getBody());

        return "admin/payments";
    }

    @GetMapping("/subscriptions")
    public String manageSubscriptions(HttpSession session, Model model) {
        ResponseEntity<SubscriptionDTO[]> subs =
            restTemplate.exchange(
                paymentUrl + "/subscriptions/all",
                HttpMethod.GET,
                authHeaders(session),
                SubscriptionDTO[].class);

        model.addAttribute("subs", subs.getBody());
        return "admin/subscriptions";
    }

    @GetMapping("/certificates")
    public String viewCertificates(HttpSession session, Model model) {
        ResponseEntity<CertificateDTO[]> certs =
            restTemplate.exchange(
                progressUrl + "/certificates/all",
                HttpMethod.GET,
                authHeaders(session),
                CertificateDTO[].class);

        model.addAttribute("certs", certs.getBody());
        return "admin/certificates";
    }

    @GetMapping("/analytics")
    public String platformAnalytics(HttpSession session, Model model) {
        ResponseEntity<Double> revenue =
            restTemplate.exchange(
                paymentUrl + "/payments/revenue",
                HttpMethod.GET,
                authHeaders(session),
                Double.class);

        ResponseEntity<CourseDTO[]> courses =
            restTemplate.exchange(
                courseUrl + "/courses/all",
                HttpMethod.GET,
                authHeaders(session),
                CourseDTO[].class);

        model.addAttribute("totalRevenue", revenue.getBody());
        model.addAttribute("courses", courses.getBody());

        return "admin/analytics-platform";
    }

    @GetMapping("/notifications")
    public String notificationsPage(Model model) {
        return "admin/notifications-send";
    }

    @PostMapping("/notifications/send")
    public String sendBulkNotification(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam List<Integer> userIds,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> bulkData = new HashMap<>();
        bulkData.put("userIds", userIds);
        bulkData.put("title", title);
        bulkData.put("message", message);

        restTemplate.exchange(
            discnotifUrl + "/notifications/bulk",
            HttpMethod.POST,
            new HttpEntity<>(bulkData, headers),
            Object.class);

        return "redirect:/admin/notifications?sent=true";
    }

    @GetMapping("/discussions")
    public String moderateDiscussions(
            @RequestParam(required = false) Integer courseId,
            HttpSession session,
            Model model) {

        if (courseId != null) {
            ResponseEntity<ThreadDTO[]> threads =
                restTemplate.exchange(
                    discnotifUrl + "/threads/course/" + courseId,
                    HttpMethod.GET,
                    authHeaders(session),
                    ThreadDTO[].class);
            model.addAttribute("threads", threads.getBody());
        } else {
            ResponseEntity<ThreadDTO[]> threads =
                restTemplate.exchange(
                    discnotifUrl + "/threads",
                    HttpMethod.GET,
                    authHeaders(session),
                    ThreadDTO[].class);
            model.addAttribute("threads", threads.getBody());
        }

        model.addAttribute("courseId", courseId);
        return "admin/discussions";
    }

    @PostMapping("/discussions/{threadId}/delete")
    public String deleteThread(
            @PathVariable int threadId,
            @RequestParam(required = false) Integer courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            discnotifUrl + "/threads/" + threadId,
            HttpMethod.DELETE,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/admin/discussions" + (courseId != null ? "?courseId=" + courseId : "");
    }
}

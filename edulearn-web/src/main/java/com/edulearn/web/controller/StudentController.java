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
import java.util.Map;

@Controller
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authUrl;

    @Value("${course.service.url}")
    private String courseUrl;

    @Value("${enrollment.service.url}")
    private String enrollmentUrl;

    @Value("${assessment.service.url}")
    private String assessmentUrl;

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
        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        int studentId = user.getUserId();

        ResponseEntity<EnrollmentDTO[]> enrollments =
            restTemplate.exchange(
                enrollmentUrl + "/enrollments/student/" + studentId,
                HttpMethod.GET,
                authHeaders(session),
                EnrollmentDTO[].class);

        ResponseEntity<Integer> unreadCount =
            restTemplate.exchange(
                discnotifUrl + "/notifications/user/" + studentId + "/count",
                HttpMethod.GET,
                authHeaders(session),
                Integer.class);

        model.addAttribute("enrollments", enrollments.getBody());
        model.addAttribute("unreadCount", unreadCount.getBody());
        model.addAttribute("user", user);

        return "student/dashboard";
    }

    @GetMapping("/courses")
    public String browseCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            Model model) {

        String url = courseUrl + "/courses";
        if (keyword != null && !keyword.isEmpty()) {
            url = courseUrl + "/courses/search?keyword=" + keyword;
        } else if (category != null) {
            url = courseUrl + "/courses/category/" + category;
        } else if (level != null) {
            url = courseUrl + "/courses/level/" + level;
        }

        ResponseEntity<CourseDTO[]> courses =
            restTemplate.getForEntity(url, CourseDTO[].class);

        model.addAttribute("courses", courses.getBody());
        model.addAttribute("keyword", keyword);
        model.addAttribute("category", category);
        model.addAttribute("level", level);

        return "student/catalog";
    }

    @GetMapping("/courses/{courseId}")
    public String courseDetail(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        CourseDTO course = restTemplate.getForObject(
            courseUrl + "/courses/" + courseId,
            CourseDTO.class);

        ResponseEntity<LessonDTO[]> lessons =
            restTemplate.getForEntity(
                courseUrl + "/lessons/course/" + courseId,
                LessonDTO[].class);

        ResponseEntity<LessonDTO[]> previews =
            restTemplate.getForEntity(
                courseUrl + "/lessons/" + courseId + "/preview",
                LessonDTO[].class);

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        boolean isEnrolled = false;
        if (user != null) {
            try {
                ResponseEntity<Boolean> enrolled =
                    restTemplate.exchange(
                        enrollmentUrl + "/enrollments/check?studentId="
                        + user.getUserId() + "&courseId=" + courseId,
                        HttpMethod.GET,
                        authHeaders(session),
                        Boolean.class);
                isEnrolled = Boolean.TRUE.equals(enrolled.getBody());
            } catch (Exception ignored) {}
        }

        model.addAttribute("course", course);
        model.addAttribute("lessons", lessons.getBody());
        model.addAttribute("previews", previews.getBody());
        model.addAttribute("isEnrolled", isEnrolled);
        model.addAttribute("user", user);

        return "student/course-detail";
    }

    @GetMapping("/checkout/{courseId}")
    public String checkoutPage(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        CourseDTO course = restTemplate.getForObject(
            courseUrl + "/courses/" + courseId,
            CourseDTO.class);

        model.addAttribute("course", course);
        model.addAttribute("user", session.getAttribute("currentUser"));

        return "student/payment";
    }

    @PostMapping("/checkout/{courseId}")
    public String processPayment(
            @PathVariable int courseId,
            @RequestParam String paymentMode,
            HttpSession session,
            Model model) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        try {
            CourseDTO course = restTemplate.getForObject(
                    courseUrl + "/courses/" + courseId,
                    CourseDTO.class);

            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("studentId", user.getUserId());
            paymentData.put("courseId", courseId);
            paymentData.put("amount", course.getPrice());
            paymentData.put("mode", paymentMode);
            paymentData.put("currency", "INR");
            paymentData.put("transactionId", "TXN" + System.currentTimeMillis());

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth((String) session.getAttribute("jwtToken"));
            headers.setContentType(MediaType.APPLICATION_JSON);

            restTemplate.exchange(
                paymentUrl + "/payments",
                HttpMethod.POST,
                new HttpEntity<>(paymentData, headers),
                Object.class);

            Map<String, Integer> enrollData = new HashMap<>();
            enrollData.put("studentId", user.getUserId());
            enrollData.put("courseId", courseId);

            restTemplate.exchange(
                enrollmentUrl + "/enrollments",
                HttpMethod.POST,
                new HttpEntity<>(enrollData, headers),
                Object.class);

            return "redirect:/student/my-courses?enrolled=true";

        } catch (Exception e) {
            model.addAttribute("error", "Payment failed: " + e.getMessage());
            return "student/payment";
        }
    }

    @GetMapping("/my-courses")
    public String myCourses(HttpSession session, Model model) {
        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        ResponseEntity<EnrollmentDTO[]> enrollments =
            restTemplate.exchange(
                enrollmentUrl + "/enrollments/student/" + user.getUserId(),
                HttpMethod.GET,
                authHeaders(session),
                EnrollmentDTO[].class);

        model.addAttribute("enrollments", enrollments.getBody());
        model.addAttribute("user", user);

        return "student/my-courses";
    }

    @GetMapping("/learn/{courseId}/{lessonId}")
    public String watchLesson(
            @PathVariable int courseId,
            @PathVariable int lessonId,
            HttpSession session,
            Model model) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        LessonDTO lesson = restTemplate.getForObject(
            courseUrl + "/lessons/" + lessonId,
            LessonDTO.class);

        ResponseEntity<LessonDTO[]> allLessons =
            restTemplate.getForEntity(
                courseUrl + "/lessons/course/" + courseId,
                LessonDTO[].class);

        ResponseEntity<Object[]> resources =
            restTemplate.getForEntity(
                courseUrl + "/lessons/" + lessonId + "/resources",
                Object[].class);

        ResponseEntity<ProgressDTO> progress =
            restTemplate.exchange(
                progressUrl + "/progress/lesson/" + user.getUserId() + "/" + lessonId,
                HttpMethod.GET,
                authHeaders(session),
                ProgressDTO.class);

        ResponseEntity<Integer> courseProgress =
            restTemplate.exchange(
                progressUrl + "/progress/course/" + user.getUserId() + "/" + courseId,
                HttpMethod.GET,
                authHeaders(session),
                Integer.class);

        model.addAttribute("lesson", lesson);
        model.addAttribute("allLessons", allLessons.getBody());
        model.addAttribute("resources", resources.getBody());
        model.addAttribute("progress", progress.getBody());
        model.addAttribute("courseProgress", courseProgress.getBody());
        model.addAttribute("courseId", courseId);
        model.addAttribute("user", user);

        return "student/lesson-watch";
    }

    @PostMapping("/progress/track")
    @ResponseBody
    public ResponseEntity<?> trackProgress(
            @RequestBody Map<String, Integer> data,
            HttpSession session) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        data.put("studentId", user.getUserId());

        restTemplate.exchange(
            progressUrl + "/progress/track",
            HttpMethod.POST,
            new HttpEntity<>(data, headers),
            Object.class);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/progress/complete/{lessonId}")
    public String markComplete(
            @PathVariable int lessonId,
            @RequestParam int courseId,
            HttpSession session) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Integer> data = new HashMap<>();
        data.put("studentId", user.getUserId());
        data.put("courseId", courseId);
        data.put("lessonId", lessonId);

        restTemplate.exchange(
            progressUrl + "/progress/complete",
            HttpMethod.PUT,
            new HttpEntity<>(data, headers),
            Object.class);

        return "redirect:/student/learn/" + courseId + "/" + lessonId + "?completed=true";
    }

    @GetMapping("/quiz/{quizId}")
    public String takeQuiz(
            @PathVariable int quizId,
            HttpSession session,
            Model model) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        QuizDTO quiz = restTemplate.getForObject(
            assessmentUrl + "/quizzes/" + quizId,
            QuizDTO.class);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        ResponseEntity<AttemptDTO> attempt =
            restTemplate.exchange(
                assessmentUrl + "/attempts/start/" + quizId + "?studentId=" + user.getUserId(),
                HttpMethod.POST,
                new HttpEntity<>(headers),
                AttemptDTO.class);

        ResponseEntity<Object[]> questions =
            restTemplate.exchange(
                assessmentUrl + "/quizzes/" + quizId + "/questions",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Object[].class);

        model.addAttribute("quiz", quiz);
        model.addAttribute("attempt", attempt.getBody());
        model.addAttribute("questions", questions.getBody());
        model.addAttribute("user", user);

        return "student/quiz-take";
    }

    @PostMapping("/quiz/{attemptId}/submit")
    public String submitQuiz(
            @PathVariable int attemptId,
            @RequestParam Map<String, String> answers,
            HttpSession session,
            Model model) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> quizAnswers = new HashMap<>(answers);
        quizAnswers.remove("_csrf");

        ResponseEntity<AttemptDTO> result =
            restTemplate.exchange(
                assessmentUrl + "/attempts/" + attemptId + "/submit",
                HttpMethod.POST,
                new HttpEntity<>(quizAnswers, headers),
                AttemptDTO.class);

        model.addAttribute("attempt", result.getBody());

        return "student/quiz-result";
    }

    @GetMapping("/quiz/{quizId}/history")
    public String quizHistory(
            @PathVariable int quizId,
            HttpSession session,
            Model model) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        ResponseEntity<AttemptDTO[]> attempts =
            restTemplate.exchange(
                assessmentUrl + "/attempts/student/" + user.getUserId(),
                HttpMethod.GET,
                authHeaders(session),
                AttemptDTO[].class);

        model.addAttribute("attempts", attempts.getBody());

        return "student/quiz-history";
    }

    @GetMapping("/certificate/{courseId}")
    public String viewCertificate(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        ResponseEntity<CertificateDTO> certificate =
            restTemplate.exchange(
                progressUrl + "/certificates/" + user.getUserId() + "/" + courseId,
                HttpMethod.GET,
                authHeaders(session),
                CertificateDTO.class);

        model.addAttribute("certificate", certificate.getBody());
        model.addAttribute("user", user);

        return "student/certificate";
    }

    @GetMapping("/forum/{courseId}")
    public String viewForum(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        ResponseEntity<ThreadDTO[]> threads =
            restTemplate.exchange(
                discnotifUrl + "/threads/course/" + courseId,
                HttpMethod.GET,
                authHeaders(session),
                ThreadDTO[].class);

        model.addAttribute("threads", threads.getBody());
        model.addAttribute("courseId", courseId);
        model.addAttribute("user", session.getAttribute("currentUser"));

        return "student/forum";
    }

    @PostMapping("/forum/{courseId}/thread")
    public String postThread(
            @PathVariable int courseId,
            @RequestParam String title,
            @RequestParam String body,
            HttpSession session) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> threadData = new HashMap<>();
        threadData.put("courseId", courseId);
        threadData.put("authorId", user.getUserId());
        threadData.put("title", title);
        threadData.put("body", body);

        restTemplate.exchange(
            discnotifUrl + "/threads",
            HttpMethod.POST,
            new HttpEntity<>(threadData, headers),
            Object.class);

        return "redirect:/student/forum/" + courseId;
    }

    @PostMapping("/forum/reply/{threadId}")
    public String postReply(
            @PathVariable int threadId,
            @RequestParam int courseId,
            @RequestParam String body,
            HttpSession session) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> replyData = new HashMap<>();
        replyData.put("threadId", threadId);
        replyData.put("authorId", user.getUserId());
        replyData.put("body", body);

        restTemplate.exchange(
            discnotifUrl + "/replies",
            HttpMethod.POST,
            new HttpEntity<>(replyData, headers),
            Object.class);

        return "redirect:/student/forum/" + courseId;
    }

    @GetMapping("/notifications")
    public String viewNotifications(HttpSession session, Model model) {
        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        ResponseEntity<NotificationDTO[]> notifications =
            restTemplate.exchange(
                discnotifUrl + "/notifications/user/" + user.getUserId(),
                HttpMethod.GET,
                authHeaders(session),
                NotificationDTO[].class);

        restTemplate.exchange(
            discnotifUrl + "/notifications/user/" + user.getUserId() + "/readAll",
            HttpMethod.PUT,
            authHeaders(session),
            Object.class);

        model.addAttribute("notifications", notifications.getBody());
        model.addAttribute("user", user);

        return "student/notifications";
    }

    @GetMapping("/subscription")
    public String subscriptionPage(HttpSession session, Model model) {
        UserDTO user = (UserDTO) session.getAttribute("currentUser");

        try {
            ResponseEntity<SubscriptionDTO> sub =
                restTemplate.exchange(
                    paymentUrl + "/subscriptions/student/" + user.getUserId(),
                    HttpMethod.GET,
                    authHeaders(session),
                    SubscriptionDTO.class);
            model.addAttribute("subscription", sub.getBody());
        } catch (Exception e) {
            model.addAttribute("subscription", null);
        }

        model.addAttribute("user", user);
        return "student/subscription";
    }

    @PostMapping("/subscription/subscribe")
    public String subscribe(
            @RequestParam String plan,
            HttpSession session) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> subData = new HashMap<>();
        subData.put("studentId", user.getUserId());
        subData.put("plan", plan);

        restTemplate.exchange(
            paymentUrl + "/subscriptions",
            HttpMethod.POST,
            new HttpEntity<>(subData, headers),
            Object.class);

        return "redirect:/student/subscription?subscribed=true";
    }
}

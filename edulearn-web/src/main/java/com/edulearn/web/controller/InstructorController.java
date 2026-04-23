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

@Controller
@RequestMapping("/instructor")
public class InstructorController {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${course.service.url}")
    private String courseUrl;

    @Value("${enrollment.service.url}")
    private String enrollmentUrl;

    @Value("${assessment.service.url}")
    private String assessmentUrl;

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

        ResponseEntity<CourseDTO[]> courses =
            restTemplate.exchange(
                courseUrl + "/courses/instructor/" + user.getUserId(),
                HttpMethod.GET,
                authHeaders(session),
                CourseDTO[].class);

        model.addAttribute("courses", courses.getBody());
        model.addAttribute("user", user);

        return "instructor/dashboard";
    }

    @GetMapping("/courses/new")
    public String createCoursePage(Model model) {
        model.addAttribute("course", new CourseDTO());
        return "instructor/course-create";
    }

    @PostMapping("/courses/new")
    public String createCourse(
            @ModelAttribute CourseDTO courseDTO,
            HttpSession session) {

        UserDTO user = (UserDTO) session.getAttribute("currentUser");
        courseDTO.setInstructorId(user.getUserId());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.exchange(
            courseUrl + "/courses",
            HttpMethod.POST,
            new HttpEntity<>(courseDTO, headers),
            CourseDTO.class);

        return "redirect:/instructor/dashboard?created=true";
    }

    @GetMapping("/courses/{courseId}/edit")
    public String editCoursePage(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        CourseDTO course = restTemplate.getForObject(
            courseUrl + "/courses/" + courseId,
            CourseDTO.class);

        model.addAttribute("course", course);
        return "instructor/course-edit";
    }

    @PostMapping("/courses/{courseId}/edit")
    public String editCourse(
            @PathVariable int courseId,
            @ModelAttribute CourseDTO courseDTO,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        courseDTO.setCourseId(courseId);
        restTemplate.exchange(
            courseUrl + "/courses/" + courseId,
            HttpMethod.PUT,
            new HttpEntity<>(courseDTO, headers),
            Object.class);

        return "redirect:/instructor/dashboard";
    }

    @PostMapping("/courses/{courseId}/publish")
    public String publishCourse(
            @PathVariable int courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            courseUrl + "/courses/" + courseId + "/publish",
            HttpMethod.PUT,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/instructor/dashboard?published=true";
    }

    @GetMapping("/courses/{courseId}/lessons")
    public String manageLessons(
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

        model.addAttribute("course", course);
        model.addAttribute("lessons", lessons.getBody());
        model.addAttribute("newLesson", new LessonDTO());

        return "instructor/lesson-manage";
    }

    @PostMapping("/courses/{courseId}/lessons/add")
    public String addLesson(
            @PathVariable int courseId,
            @ModelAttribute LessonDTO lessonDTO,
            HttpSession session) {

        lessonDTO.setCourseId(courseId);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.exchange(
            courseUrl + "/lessons",
            HttpMethod.POST,
            new HttpEntity<>(lessonDTO, headers),
            Object.class);

        return "redirect:/instructor/courses/" + courseId + "/lessons";
    }

    @PostMapping("/lessons/{lessonId}/delete")
    public String deleteLesson(
            @PathVariable int lessonId,
            @RequestParam int courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            courseUrl + "/lessons/" + lessonId,
            HttpMethod.DELETE,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/instructor/courses/" + courseId + "/lessons";
    }

    @GetMapping("/courses/{courseId}/quiz/new")
    public String quizBuilderPage(
            @PathVariable int courseId,
            Model model) {

        model.addAttribute("courseId", courseId);
        model.addAttribute("quiz", new QuizDTO());
        return "instructor/quiz-builder";
    }

    @PostMapping("/courses/{courseId}/quiz/new")
    public String createQuiz(
            @PathVariable int courseId,
            @ModelAttribute QuizDTO quizDTO,
            HttpSession session) {

        quizDTO.setCourseId(courseId);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.exchange(
            assessmentUrl + "/quizzes",
            HttpMethod.POST,
            new HttpEntity<>(quizDTO, headers),
            Object.class);

        return "redirect:/instructor/dashboard";
    }

    @GetMapping("/courses/{courseId}/students")
    public String viewStudents(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        ResponseEntity<EnrollmentDTO[]> enrollments =
            restTemplate.exchange(
                enrollmentUrl + "/enrollments/course/" + courseId,
                HttpMethod.GET,
                authHeaders(session),
                EnrollmentDTO[].class);

        model.addAttribute("enrollments", enrollments.getBody());
        model.addAttribute("courseId", courseId);

        return "instructor/students";
    }

    @GetMapping("/courses/{courseId}/analytics")
    public String courseAnalytics(
            @PathVariable int courseId,
            HttpSession session,
            Model model) {

        ResponseEntity<Integer> count =
            restTemplate.exchange(
                enrollmentUrl + "/enrollments/count/" + courseId,
                HttpMethod.GET,
                authHeaders(session),
                Integer.class);

        ResponseEntity<QuizDTO[]> quizzes =
            restTemplate.exchange(
                assessmentUrl + "/quizzes/course/" + courseId,
                HttpMethod.GET,
                authHeaders(session),
                QuizDTO[].class);

        model.addAttribute("enrollmentCount", count.getBody());
        model.addAttribute("quizzes", quizzes.getBody());
        model.addAttribute("courseId", courseId);

        return "instructor/analytics";
    }

    @GetMapping("/courses/{courseId}/forum")
    public String moderateForum(
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

        return "instructor/forum-moderate";
    }

    @PostMapping("/forum/{threadId}/pin")
    public String pinThread(
            @PathVariable int threadId,
            @RequestParam int courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            discnotifUrl + "/threads/" + threadId + "/pin",
            HttpMethod.PUT,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/instructor/courses/" + courseId + "/forum";
    }

    @PostMapping("/forum/{threadId}/close")
    public String closeThread(
            @PathVariable int threadId,
            @RequestParam int courseId,
            HttpSession session) {

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth((String) session.getAttribute("jwtToken"));

        restTemplate.exchange(
            discnotifUrl + "/threads/" + threadId + "/close",
            HttpMethod.PUT,
            new HttpEntity<>(headers),
            Object.class);

        return "redirect:/instructor/courses/" + courseId + "/forum";
    }
}

package com.edulearn.courselesson.resource;

import com.edulearn.courselesson.entity.Course;
import com.edulearn.courselesson.exception.CourseNotFoundException;
import com.edulearn.courselesson.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseResource {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllPublishedCourses() {
        // Technically, the requirement says "all published", but we only have getAllCourses in service
        // Let's filter here or rely on the service. For now, we filter.
        List<Course> publishedCourses = courseService.getAllCourses().stream()
                .filter(Course::isPublished)
                .toList();
        return ResponseEntity.ok(publishedCourses);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Course>> getFeaturedCourses() {
        return ResponseEntity.ok(courseService.getFeaturedCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable("id") int id) {
        Course course = courseService.getCourseById(id)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));
        return ResponseEntity.ok(course);
    }

    @GetMapping("/category/{cat}")
    public ResponseEntity<List<Course>> getCoursesByCategory(@PathVariable("cat") String cat) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(cat));
    }

    @GetMapping("/instructor/{id}")
    public ResponseEntity<List<Course>> getCoursesByInstructor(@PathVariable("id") int id) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(courseService.searchCourses(keyword));
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<Course>> getCoursesByLevel(@PathVariable("level") String level) {
        return ResponseEntity.ok(courseService.getCoursesByLevel(level));
    }

    @GetMapping("/language/{lang}")
    public ResponseEntity<List<Course>> getCoursesByLanguage(@PathVariable("lang") String lang) {
        return ResponseEntity.ok(courseService.getCoursesByLanguage(lang));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable("id") int id, @RequestBody Course course) {
        course.setCourseId(id);
        Course updatedCourse = courseService.updateCourse(course);
        return ResponseEntity.ok(updatedCourse);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Void> publishCourse(@PathVariable("id") int id) {
        courseService.publishCourse(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/unpublish")
    public ResponseEntity<Void> unpublishCourse(@PathVariable("id") int id) {
        courseService.unpublishCourse(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveCourse(@PathVariable("id") int id) {
        courseService.approveCourse(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectCourse(@PathVariable("id") int id) {
        courseService.rejectCourse(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable("id") int id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}

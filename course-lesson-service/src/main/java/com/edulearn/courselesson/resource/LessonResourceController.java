package com.edulearn.courselesson.resource;

import com.edulearn.courselesson.entity.Lesson;
import com.edulearn.courselesson.entity.LessonResource;
import com.edulearn.courselesson.exception.LessonNotFoundException;
import com.edulearn.courselesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lessons")
@RequiredArgsConstructor
public class LessonResourceController { // Renamed from LessonResource to avoid naming conflict with Entity

    private final LessonService lessonService;

    @PostMapping
    public ResponseEntity<Lesson> addLesson(@RequestBody Lesson lesson) {
        Lesson createdLesson = lessonService.addLesson(lesson);
        return new ResponseEntity<>(createdLesson, HttpStatus.CREATED);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Lesson>> getLessonsByCourse(@PathVariable("courseId") int courseId) {
        return ResponseEntity.ok(lessonService.getLessonsByCourse(courseId));
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<Lesson> getLessonById(@PathVariable("lessonId") int lessonId) {
        Lesson lesson = lessonService.getLessonById(lessonId)
                .orElseThrow(() -> new LessonNotFoundException("Lesson not found with id: " + lessonId));
        return ResponseEntity.ok(lesson);
    }

    @PutMapping("/{lessonId}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable("lessonId") int lessonId, @RequestBody Lesson lesson) {
        lesson.setLessonId(lessonId);
        Lesson updatedLesson = lessonService.updateLesson(lesson);
        return ResponseEntity.ok(updatedLesson);
    }

    @DeleteMapping("/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable("lessonId") int lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<List<Lesson>> reorderLessons(@RequestBody List<Lesson> lessons) {
        List<Lesson> reorderedLessons = lessonService.reorderLessons(lessons);
        return ResponseEntity.ok(reorderedLessons);
    }

    @GetMapping("/{courseId}/preview")
    public ResponseEntity<List<Lesson>> getPreviewLessons(@PathVariable("courseId") int courseId) {
        return ResponseEntity.ok(lessonService.getPreviewLessons(courseId));
    }

    @PostMapping("/{lessonId}/resources")
    public ResponseEntity<LessonResource> addResource(@PathVariable("lessonId") int lessonId, @RequestBody LessonResource resource) {
        LessonResource createdResource = lessonService.addResource(lessonId, resource);
        return new ResponseEntity<>(createdResource, HttpStatus.CREATED);
    }

    @GetMapping("/{lessonId}/resources")
    public ResponseEntity<List<LessonResource>> getResourcesByLesson(@PathVariable("lessonId") int lessonId) {
        return ResponseEntity.ok(lessonService.getResourcesByLesson(lessonId));
    }

    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<Void> removeResource(@PathVariable("resourceId") int resourceId) {
        lessonService.removeResource(resourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count/{courseId}")
    public ResponseEntity<Integer> countLessonsByCourse(@PathVariable("courseId") int courseId) {
        return ResponseEntity.ok(lessonService.countLessonsByCourse(courseId));
    }
}

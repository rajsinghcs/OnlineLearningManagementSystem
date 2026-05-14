package com.edulearn.courselesson.resource;

import com.edulearn.courselesson.entity.Rating;
import com.edulearn.courselesson.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses/ratings")
@CrossOrigin(origins = "*")
public class RatingResource {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<Rating> submitRating(@RequestBody Rating rating) {
        return ResponseEntity.ok(ratingService.submitRating(rating));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<List<Rating>> getRatingsByCourse(@PathVariable int courseId) {
        return ResponseEntity.ok(ratingService.getRatingsByCourse(courseId));
    }

    @GetMapping("/{courseId}/student/{studentId}")
    public ResponseEntity<Rating> getRatingByCourseAndStudent(@PathVariable int courseId, @PathVariable int studentId) {
        Rating rating = ratingService.getRatingByCourseAndStudent(courseId, studentId);
        if (rating == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rating);
    }
}

package com.edulearn.courselesson.service;

import com.edulearn.courselesson.entity.Rating;
import java.util.List;

public interface RatingService {
    Rating submitRating(Rating rating);
    List<Rating> getRatingsByCourse(int courseId);
    Rating getRatingByCourseAndStudent(int courseId, int studentId);
}

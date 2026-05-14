package com.edulearn.courselesson.serviceimpl;

import com.edulearn.courselesson.entity.Course;
import com.edulearn.courselesson.entity.Rating;
import com.edulearn.courselesson.repository.CourseRepository;
import com.edulearn.courselesson.repository.RatingRepository;
import com.edulearn.courselesson.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RatingServiceImpl implements RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    @Transactional
    public Rating submitRating(Rating rating) {
        Optional<Rating> existingRating = ratingRepository.findByCourseIdAndStudentId(rating.getCourseId(), rating.getStudentId());
        
        Rating savedRating;
        if (existingRating.isPresent()) {
            Rating r = existingRating.get();
            r.setRatingValue(rating.getRatingValue());
            r.setComment(rating.getComment());
            savedRating = ratingRepository.save(r);
        } else {
            savedRating = ratingRepository.save(rating);
        }

        updateCourseRating(rating.getCourseId());
        return savedRating;
    }

    @Override
    public List<Rating> getRatingsByCourse(int courseId) {
        return ratingRepository.findByCourseId(courseId);
    }

    @Override
    public Rating getRatingByCourseAndStudent(int courseId, int studentId) {
        return ratingRepository.findByCourseIdAndStudentId(courseId, studentId).orElse(null);
    }

    private void updateCourseRating(int courseId) {
        List<Rating> ratings = ratingRepository.findByCourseId(courseId);
        Course course = courseRepository.findById(courseId).orElse(null);
        
        if (course != null && !ratings.isEmpty()) {
            double average = ratings.stream()
                    .mapToInt(Rating::getRatingValue)
                    .average()
                    .orElse(0.0);
            
            course.setAverageRating(Math.round(average * 10.0) / 10.0); // Round to 1 decimal place
            course.setTotalRatings(ratings.size());
            courseRepository.save(course);
        }
    }
}

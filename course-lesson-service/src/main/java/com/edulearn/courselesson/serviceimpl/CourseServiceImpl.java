package com.edulearn.courselesson.serviceimpl;

import com.edulearn.courselesson.entity.Course;
import com.edulearn.courselesson.entity.Lesson;
import com.edulearn.courselesson.exception.CourseNotApprovedException;
import com.edulearn.courselesson.exception.CourseNotFoundException;
import com.edulearn.courselesson.repository.CourseRepository;
import com.edulearn.courselesson.service.CourseService;
import com.edulearn.courselesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final LessonService lessonService;

    @Override
    public Course createCourse(Course course) {
        course.setPublished(false);
        course.setApproved(false);
        course.setCreatedAt(LocalDate.now());
        return courseRepository.save(course);
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Optional<Course> getCourseById(int courseId) {
        return courseRepository.findById(courseId);
    }

    @Override
    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    @Override
    public List<Course> getCoursesByInstructor(int instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    @Override
    public List<Course> searchCourses(String keyword) {
        return courseRepository.searchByKeyword(keyword);
    }

    @Override
    public Course updateCourse(Course course) {
        if (!courseRepository.existsById(course.getCourseId())) {
            throw new CourseNotFoundException("Course not found with id: " + course.getCourseId());
        }
        return courseRepository.save(course);
    }

    @Override
    public void publishCourse(int courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));
        if (!course.isApproved()) {
            throw new CourseNotApprovedException("Course must be approved before publishing");
        }
        course.setPublished(true);
        course.setRejected(false);
        courseRepository.save(course);
    }

    @Override
    public void unpublishCourse(int courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));
        course.setPublished(false);
        courseRepository.save(course);
    }

    @Override
    public void deleteCourse(int courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new CourseNotFoundException("Course not found with id: " + courseId);
        }
        
        List<Lesson> lessons = lessonService.getLessonsByCourse(courseId);
        for (Lesson lesson : lessons) {
            lessonService.deleteLesson(lesson.getLessonId());
        }
        
        courseRepository.deleteById(courseId);
    }

    @Override
    public List<Course> getFeaturedCourses() {
        // Find all published and approved courses and manually take top 10
        List<Course> approvedAndPublished = courseRepository.findByIsPublished(true).stream()
                .filter(Course::isApproved)
                .toList();
        return approvedAndPublished.stream().limit(10).toList();
    }

    @Override
    public void approveCourse(int courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));
        course.setApproved(true);
        course.setRejected(false);
        courseRepository.save(course);
    }

    @Override
    public void rejectCourse(int courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));
        course.setApproved(false);
        course.setPublished(false);
        course.setRejected(true);
        courseRepository.save(course);
    }

    @Override
    public List<Course> getCoursesByLevel(String level) {
        return courseRepository.findByLevel(level);
    }

    @Override
    public List<Course> getCoursesByLanguage(String language) {
        return courseRepository.findByLanguage(language);
    }
}

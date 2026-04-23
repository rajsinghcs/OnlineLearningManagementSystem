package com.edulearn.courselesson.service;

import com.edulearn.courselesson.entity.Course;

import java.util.List;
import java.util.Optional;

public interface CourseService {
    Course createCourse(Course course);
    List<Course> getAllCourses();
    Optional<Course> getCourseById(int courseId);
    List<Course> getCoursesByCategory(String category);
    List<Course> getCoursesByInstructor(int instructorId);
    List<Course> searchCourses(String keyword);
    Course updateCourse(Course course);
    void publishCourse(int courseId);
    void unpublishCourse(int courseId);
    void deleteCourse(int courseId);
    List<Course> getFeaturedCourses();
    void approveCourse(int courseId);
    void rejectCourse(int courseId);
    List<Course> getCoursesByLevel(String level);
    List<Course> getCoursesByLanguage(String language);
}

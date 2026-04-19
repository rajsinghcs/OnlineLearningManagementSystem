package com.edulearn.courselesson.repository;

import com.edulearn.courselesson.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    List<Course> findByTitle(String title);

    List<Course> findByCategory(String category);

    List<Course> findByInstructorId(int instructorId);

    List<Course> findByLevel(String level);

    List<Course> findByIsPublished(boolean isPublished);

    List<Course> findByIsApproved(boolean isApproved);

    List<Course> findByPriceLessThanEqual(double price);

    List<Course> findByLanguage(String language);

    @Query("SELECT c FROM Course c WHERE " +
           "c.title LIKE %:keyword% " +
           "OR c.description LIKE %:keyword% " +
           "OR c.category LIKE %:keyword%")
    List<Course> searchByKeyword(@Param("keyword") String keyword);
}

package com.edulearn.courselesson.repository;

import com.edulearn.courselesson.entity.LessonResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonResourceRepository extends JpaRepository<LessonResource, Integer> {

    List<LessonResource> findByLessonId(int lessonId);

    void deleteByLessonId(int lessonId);
}

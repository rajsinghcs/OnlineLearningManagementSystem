package com.edulearn.courselesson.service;

import com.edulearn.courselesson.entity.Lesson;
import com.edulearn.courselesson.entity.LessonResource;

import java.util.List;
import java.util.Optional;

public interface LessonService {
    Lesson addLesson(Lesson lesson);
    List<Lesson> getLessonsByCourse(int courseId);
    Optional<Lesson> getLessonById(int lessonId);
    Lesson updateLesson(Lesson lesson);
    void deleteLesson(int lessonId);
    List<Lesson> reorderLessons(List<Lesson> lessons);
    LessonResource addResource(int lessonId, LessonResource resource);
    void removeResource(int resourceId);
    List<Lesson> getPreviewLessons(int courseId);
    List<LessonResource> getResourcesByLesson(int lessonId);
    int countLessonsByCourse(int courseId);
}

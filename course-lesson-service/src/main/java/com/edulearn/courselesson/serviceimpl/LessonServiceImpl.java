package com.edulearn.courselesson.serviceimpl;

import com.edulearn.courselesson.entity.Lesson;
import com.edulearn.courselesson.entity.LessonResource;
import com.edulearn.courselesson.exception.CourseNotFoundException;
import com.edulearn.courselesson.exception.LessonNotFoundException;
import com.edulearn.courselesson.repository.CourseRepository;
import com.edulearn.courselesson.repository.LessonRepository;
import com.edulearn.courselesson.repository.LessonResourceRepository;
import com.edulearn.courselesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final LessonResourceRepository lessonResourceRepository;

    @Override
    public Lesson addLesson(Lesson lesson) {
        if (!courseRepository.existsById(lesson.getCourseId())) {
            throw new CourseNotFoundException("Course not found with id: " + lesson.getCourseId());
        }
        
        List<Lesson> existingLessons = lessonRepository.findByCourseId(lesson.getCourseId());
        int maxOrderIndex = existingLessons.stream()
                .mapToInt(Lesson::getOrderIndex)
                .max()
                .orElse(0);
        
        lesson.setOrderIndex(maxOrderIndex + 1);
        return lessonRepository.save(lesson);
    }

    @Override
    public List<Lesson> getLessonsByCourse(int courseId) {
        return lessonRepository.findByCourseIdOrderByOrderIndex(courseId);
    }

    @Override
    public Optional<Lesson> getLessonById(int lessonId) {
        return lessonRepository.findByLessonId(lessonId);
    }

    @Override
    public Lesson updateLesson(Lesson lesson) {
        if (!lessonRepository.existsById(lesson.getLessonId())) {
            throw new LessonNotFoundException("Lesson not found with id: " + lesson.getLessonId());
        }
        return lessonRepository.save(lesson);
    }

    @Override
    @Transactional
    public void deleteLesson(int lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new LessonNotFoundException("Lesson not found with id: " + lessonId);
        }
        lessonResourceRepository.deleteByLessonId(lessonId);
        lessonRepository.deleteById(lessonId);
    }

    @Override
    public List<Lesson> reorderLessons(List<Lesson> lessons) {
        return lessonRepository.saveAll(lessons);
    }

    @Override
    public LessonResource addResource(int lessonId, LessonResource resource) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new LessonNotFoundException("Lesson not found with id: " + lessonId);
        }
        resource.setLessonId(lessonId);
        return lessonResourceRepository.save(resource);
    }

    @Override
    public void removeResource(int resourceId) {
        lessonResourceRepository.deleteById(resourceId);
    }

    @Override
    public List<Lesson> getPreviewLessons(int courseId) {
        return lessonRepository.findByCourseIdAndIsPreview(courseId, true);
    }

    @Override
    public List<LessonResource> getResourcesByLesson(int lessonId) {
        return lessonResourceRepository.findByLessonId(lessonId);
    }

    @Override
    public int countLessonsByCourse(int courseId) {
        return lessonRepository.countByCourseId(courseId);
    }
}

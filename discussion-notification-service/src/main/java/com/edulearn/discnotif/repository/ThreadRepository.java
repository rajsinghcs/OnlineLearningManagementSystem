package com.edulearn.discnotif.repository;

import com.edulearn.discnotif.entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreadRepository extends JpaRepository<DiscussionThread, Integer> {

    List<DiscussionThread> findByCourseId(int courseId);

    List<DiscussionThread> findByLessonId(int lessonId);

    List<DiscussionThread> findByAuthorId(int authorId);

    List<DiscussionThread> findByIsPinned(boolean isPinned);

    List<DiscussionThread> findByCourseIdOrderByIsPinnedDesc(int courseId);

    @Query("SELECT t FROM DiscussionThread t WHERE t.title LIKE %:kw% OR t.body LIKE %:kw%")
    List<DiscussionThread> searchByKeyword(@Param("kw") String keyword);
}

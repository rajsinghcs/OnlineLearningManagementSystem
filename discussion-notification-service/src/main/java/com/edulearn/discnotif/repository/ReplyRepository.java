package com.edulearn.discnotif.repository;

import com.edulearn.discnotif.entity.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ReplyRepository extends JpaRepository<Reply, Integer> {

    List<Reply> findByThreadId(int threadId);

    List<Reply> findByAuthorId(int authorId);

    @Transactional
    void deleteByThreadId(int threadId);
}

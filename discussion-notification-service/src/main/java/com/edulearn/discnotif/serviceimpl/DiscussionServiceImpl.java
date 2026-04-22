package com.edulearn.discnotif.serviceimpl;

import com.edulearn.discnotif.entity.DiscussionThread;
import com.edulearn.discnotif.entity.Reply;
import com.edulearn.discnotif.exception.ReplyNotFoundException;
import com.edulearn.discnotif.exception.ThreadClosedException;
import com.edulearn.discnotif.exception.ThreadNotFoundException;
import com.edulearn.discnotif.repository.ReplyRepository;
import com.edulearn.discnotif.repository.ThreadRepository;
import com.edulearn.discnotif.service.DiscussionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionServiceImpl implements DiscussionService {

    private final ThreadRepository threadRepository;
    private final ReplyRepository replyRepository;

    @Override
    public DiscussionThread createThread(DiscussionThread thread) {
        return threadRepository.save(thread);
    }

    @Override
    public Reply postReply(Reply reply) {
        DiscussionThread thread = threadRepository.findById(reply.getThreadId())
                .orElseThrow(() -> new ThreadNotFoundException("Thread not found with id: " + reply.getThreadId()));

        if (thread.isClosed()) {
            throw new ThreadClosedException("Cannot reply to a closed thread.");
        }

        return replyRepository.save(reply);
    }

    @Override
    public List<DiscussionThread> getThreadsByCourse(int courseId) {
        return threadRepository.findByCourseIdOrderByIsPinnedDesc(courseId);
    }

    @Override
    public List<DiscussionThread> getThreadsByLesson(int lessonId) {
        return threadRepository.findByLessonId(lessonId);
    }

    @Override
    public List<Reply> getRepliesByThread(int threadId) {
        return replyRepository.findByThreadId(threadId);
    }

    @Override
    public void upvoteReply(int replyId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("Reply not found with id: " + replyId));
        reply.setUpvotes(reply.getUpvotes() + 1);
        replyRepository.save(reply);
    }

    @Override
    public void acceptReply(int replyId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("Reply not found with id: " + replyId));
        reply.setAccepted(true);
        replyRepository.save(reply);
    }

    @Override
    public void pinThread(int threadId) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new ThreadNotFoundException("Thread not found with id: " + threadId));
        thread.setPinned(true);
        threadRepository.save(thread);
    }

    @Override
    public void closeThread(int threadId) {
        DiscussionThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new ThreadNotFoundException("Thread not found with id: " + threadId));
        thread.setClosed(true);
        threadRepository.save(thread);
    }

    @Override
    public void deleteThread(int threadId) {
        replyRepository.deleteByThreadId(threadId);
        threadRepository.deleteById(threadId);
    }

    @Override
    public void deleteReply(int replyId) {
        replyRepository.deleteById(replyId);
    }

    @Override
    public List<DiscussionThread> searchThreads(String keyword) {
        return threadRepository.searchByKeyword(keyword);
    }
}

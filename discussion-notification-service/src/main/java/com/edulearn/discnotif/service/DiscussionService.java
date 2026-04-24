package com.edulearn.discnotif.service;

import com.edulearn.discnotif.entity.DiscussionThread;
import com.edulearn.discnotif.entity.Reply;

import java.util.List;

public interface DiscussionService {
    DiscussionThread createThread(DiscussionThread thread);
    Reply postReply(Reply reply);
    List<DiscussionThread> getThreadsByCourse(int courseId);
    List<DiscussionThread> getThreadsByLesson(int lessonId);
    List<Reply> getRepliesByThread(int threadId);
    void upvoteReply(int replyId);
    void acceptReply(int replyId);
    void pinThread(int threadId);
    void closeThread(int threadId);
    void deleteThread(int threadId);
    void deleteReply(int replyId);
    List<DiscussionThread> searchThreads(String keyword);
}

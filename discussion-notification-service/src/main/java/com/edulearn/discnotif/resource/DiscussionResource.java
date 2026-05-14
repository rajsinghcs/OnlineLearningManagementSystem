package com.edulearn.discnotif.resource;

import com.edulearn.discnotif.entity.DiscussionThread;
import com.edulearn.discnotif.entity.Reply;
import com.edulearn.discnotif.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/threads")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Discussion Forum", description = "Endpoints for forum threads and replies")
public class DiscussionResource {

    private final DiscussionService discussionService;

    @PostMapping
    @Operation(summary = "Create a new thread")
    public ResponseEntity<DiscussionThread> createThread(@RequestBody DiscussionThread thread) {
        return ResponseEntity.status(HttpStatus.CREATED).body(discussionService.createThread(thread));
    }

    @GetMapping
    @Operation(summary = "Get all threads", description = "Returns all threads in the system (Admin use)")
    public ResponseEntity<List<DiscussionThread>> getAllThreads() {
        return ResponseEntity.ok(discussionService.getAllThreads());
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "Get threads by course", description = "Returns threads for a course, pinned ones first")
    public ResponseEntity<List<DiscussionThread>> getThreadsByCourse(@PathVariable int courseId) {
        return ResponseEntity.ok(discussionService.getThreadsByCourse(courseId));
    }

    @GetMapping("/lesson/{lessonId}")
    @Operation(summary = "Get threads by lesson")
    public ResponseEntity<List<DiscussionThread>> getThreadsByLesson(@PathVariable int lessonId) {
        return ResponseEntity.ok(discussionService.getThreadsByLesson(lessonId));
    }

    @GetMapping("/search")
    @Operation(summary = "Search threads by keyword")
    public ResponseEntity<List<DiscussionThread>> searchThreads(@RequestParam String keyword) {
        return ResponseEntity.ok(discussionService.searchThreads(keyword));
    }

    @DeleteMapping("/{threadId}")
    @Operation(summary = "Delete a thread and its replies")
    public ResponseEntity<Void> deleteThread(@PathVariable int threadId) {
        discussionService.deleteThread(threadId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{threadId}/pin")
    @Operation(summary = "Pin a thread")
    public ResponseEntity<Void> pinThread(@PathVariable int threadId) {
        discussionService.pinThread(threadId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{threadId}/close")
    @Operation(summary = "Close a thread")
    public ResponseEntity<Void> closeThread(@PathVariable int threadId) {
        discussionService.closeThread(threadId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/replies")
    @Operation(summary = "Post a reply")
    public ResponseEntity<Reply> postReply(@RequestBody Reply reply) {
        return ResponseEntity.status(HttpStatus.CREATED).body(discussionService.postReply(reply));
    }

    @GetMapping("/replies/thread/{threadId}")
    @Operation(summary = "Get replies for a thread", description = "Filters private replies based on viewer context")
    public ResponseEntity<List<Reply>> getRepliesByThread(
            @PathVariable int threadId,
            @RequestParam(required = false) Integer viewerId,
            @RequestParam(required = false) String viewerRole) {
        return ResponseEntity.ok(discussionService.getRepliesByThread(threadId, viewerId, viewerRole));
    }

    @PutMapping("/replies/{replyId}/upvote")
    @Operation(summary = "Upvote a reply")
    public ResponseEntity<Void> upvoteReply(@PathVariable int replyId) {
        discussionService.upvoteReply(replyId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/replies/{replyId}/accept")
    @Operation(summary = "Mark a reply as the accepted answer")
    public ResponseEntity<Void> acceptReply(@PathVariable int replyId) {
        discussionService.acceptReply(replyId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/replies/{replyId}")
    @Operation(summary = "Delete a reply")
    public ResponseEntity<Void> deleteReply(@PathVariable int replyId) {
        discussionService.deleteReply(replyId);
        return ResponseEntity.noContent().build();
    }
}

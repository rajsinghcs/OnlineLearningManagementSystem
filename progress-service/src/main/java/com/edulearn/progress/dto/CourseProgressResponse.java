package com.edulearn.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgressResponse {
    private int studentId;
    private int courseId;
    private int progressPercentage;
    private List<Integer> completedLessonIds;
}

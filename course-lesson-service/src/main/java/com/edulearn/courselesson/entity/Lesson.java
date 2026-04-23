package com.edulearn.courselesson.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int lessonId;

    @Column(nullable = false)
    private int courseId;

    @Column(nullable = false)
    private String title;

    private String contentType; // VIDEO / ARTICLE / PDF

    private String contentUrl;

    private int durationMinutes;

    private int orderIndex;

    private String description;

    private boolean isPreview = false;
}

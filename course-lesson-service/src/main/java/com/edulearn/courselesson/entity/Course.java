package com.edulearn.courselesson.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int courseId;

    @Column(nullable = false)
    private String title;

    private String description;

    private String category;

    private String level; // BEGINNER / INTERMEDIATE / ADVANCED

    private double price;

    @Column(nullable = false)
    private int instructorId;

    private String thumbnailUrl;

    private int totalDuration; // total minutes

    private boolean isPublished = false;
    
    private boolean isApproved = false;
    
    private boolean isRejected = false;

    private LocalDate createdAt;

    private String language;

    @Column(columnDefinition = "double default 0.0")
    private double averageRating = 0.0;

    @Column(columnDefinition = "int default 0")
    private int totalRatings = 0;
}

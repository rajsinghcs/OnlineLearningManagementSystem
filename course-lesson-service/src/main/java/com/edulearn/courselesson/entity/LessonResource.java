package com.edulearn.courselesson.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lesson_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int resourceId;

    @Column(nullable = false)
    private int lessonId;

    private String name;

    private String fileUrl;

    private String fileType; // PDF / SLIDES / CODE

    private long sizeKb;
}

package com.edulearn.courselesson.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"courseId", "studentId"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ratingId;

    @Column(nullable = false)
    private int courseId;

    @Column(nullable = false)
    private int studentId;

    @Column(nullable = false)
    private int ratingValue; // 1 to 5

    private String comment;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

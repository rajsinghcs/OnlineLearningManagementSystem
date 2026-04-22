package com.edulearn.progress.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int certificateId;

    @Column(nullable = false)
    private int studentId;

    @Column(nullable = false)
    private int courseId;

    private LocalDate issuedAt;

    private String certificateUrl;

    @Column(unique = true, nullable = false)
    private String verificationCode;

    private String instructorName;

    private String courseName;
}

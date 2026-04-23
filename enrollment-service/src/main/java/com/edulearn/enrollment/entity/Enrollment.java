package com.edulearn.enrollment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer enrollmentId;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "course_id", nullable = false)
    private Integer courseId;

    @Column(name = "enrolled_at", updatable = false)
    private LocalDate enrolledAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "status")
    private String status;

    @Column(name = "progress_percent", columnDefinition = "int default 0")
    private int progressPercent;

    @Column(name = "certificate_issued", columnDefinition = "boolean default false")
    private boolean certificateIssued;

    @PrePersist
    protected void onCreate() {
        if (enrolledAt == null) {
            enrolledAt = LocalDate.now();
        }
    }
}

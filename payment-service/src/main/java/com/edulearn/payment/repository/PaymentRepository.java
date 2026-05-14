package com.edulearn.payment.repository;

import com.edulearn.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByStudentId(int studentId);

    List<Payment> findByCourseId(int courseId);

    List<Payment> findByStatus(String status);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findFirstByStudentIdAndCourseIdOrderByPaidAtDesc(int studentId, int courseId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.studentId = :studentId")
    Double sumAmountByStudentId(@Param("studentId") int studentId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalRevenue();
}

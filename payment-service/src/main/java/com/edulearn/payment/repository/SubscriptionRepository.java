package com.edulearn.payment.repository;

import com.edulearn.payment.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    List<Subscription> findByStudentId(int studentId);

    Optional<Subscription> findByStudentIdAndStatus(int studentId, String status);

    List<Subscription> findByEndDateBefore(LocalDate date);

    Long countByPlan(String plan);
}

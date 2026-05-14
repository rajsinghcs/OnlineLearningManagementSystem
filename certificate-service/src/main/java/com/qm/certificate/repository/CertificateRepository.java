package com.qm.certificate.repository;

import com.qm.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    List<Certificate> findByStudentId(String studentId);
}

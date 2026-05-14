package com.qm.certificate.exception;

public class CertificateNotFoundException extends RuntimeException {
    public CertificateNotFoundException(String message) {
        super(message);
    }
}

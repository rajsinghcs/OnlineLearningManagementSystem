package com.qm.certificate.exception;

public class CertificateRevokedException extends RuntimeException {
    public CertificateRevokedException(String message) {
        super(message);
    }
}

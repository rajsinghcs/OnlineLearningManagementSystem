package com.edulearn.discnotif.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ThreadClosedException extends RuntimeException {
    public ThreadClosedException(String message) {
        super(message);
    }
}

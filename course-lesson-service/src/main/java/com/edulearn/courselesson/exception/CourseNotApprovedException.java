package com.edulearn.courselesson.exception;

public class CourseNotApprovedException extends RuntimeException {
    public CourseNotApprovedException(String message) {
        super(message);
    }
}

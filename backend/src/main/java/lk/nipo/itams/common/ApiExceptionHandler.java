package lk.nipo.itams.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lk.nipo.itams.assets.exception.DuplicateAssetException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    public record ErrorResponse(boolean success, String message, Map<String, String> errors, Instant timestamp, String path) {}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> invalid(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) errors.put(error.getField(), error.getDefaultMessage());
        return response(HttpStatus.BAD_REQUEST, "Please correct the highlighted fields", errors, request);
    }

    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class})
    ResponseEntity<ErrorResponse> badRequest(Exception ex, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, ex.getMessage(), Map.of(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> conflict(DataIntegrityViolationException ex, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, "An asset with this asset code or serial number already exists", Map.of(), request);
    }

    @ExceptionHandler(DuplicateAssetException.class)
    ResponseEntity<ErrorResponse> duplicate(DuplicateAssetException ex, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, ex.getMessage(), Map.of(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> unexpected(Exception ex, HttpServletRequest request) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", Map.of(), request);
    }

    private ResponseEntity<ErrorResponse> response(HttpStatus status, String message, Map<String, String> errors, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ErrorResponse(false, message, errors, Instant.now(), request.getRequestURI()));
    }
}

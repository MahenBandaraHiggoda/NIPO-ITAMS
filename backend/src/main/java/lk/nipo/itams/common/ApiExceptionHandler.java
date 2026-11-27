package lk.nipo.itams.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lk.nipo.itams.assets.exception.DuplicateAssetException;
import lk.nipo.itams.departments.exception.DuplicateDepartmentException;
import lk.nipo.itams.employees.exception.DuplicateEmployeeException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

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
        String path = request.getRequestURI();
        String message;
        if (path.startsWith("/api/employees")) {
            message = "An employee with this work email already exists";
        } else if (path.startsWith("/api/departments")) {
            message = "A department or division with this name and type already exists";
        } else if (path.startsWith("/api/assignments")) {
            message = "This asset already has an active assignment";
        } else {
            message = "An asset with this asset code or serial number already exists";
        }
        return response(HttpStatus.CONFLICT, message, Map.of(), request);
    }

    @ExceptionHandler(DuplicateAssetException.class)
    ResponseEntity<ErrorResponse> duplicate(DuplicateAssetException ex, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, ex.getMessage(), Map.of(), request);
    }

    @ExceptionHandler(DuplicateDepartmentException.class)
    ResponseEntity<ErrorResponse> duplicateDepartment(DuplicateDepartmentException ex, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, ex.getMessage(), Map.of(), request);
    }

    @ExceptionHandler(DuplicateEmployeeException.class)
    ResponseEntity<ErrorResponse> duplicateEmployee(DuplicateEmployeeException ex, HttpServletRequest request) {
        return response(HttpStatus.CONFLICT, ex.getMessage(), Map.of(), request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ErrorResponse> status(ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() == null ? status.getReasonPhrase() : ex.getReason();
        return response(status, message, Map.of(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> unexpected(Exception ex, HttpServletRequest request) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", Map.of(), request);
    }

    private ResponseEntity<ErrorResponse> response(HttpStatus status, String message, Map<String, String> errors, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ErrorResponse(false, message, errors, Instant.now(), request.getRequestURI()));
    }
}

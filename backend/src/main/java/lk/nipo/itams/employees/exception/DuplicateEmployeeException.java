package lk.nipo.itams.employees.exception;

public class DuplicateEmployeeException extends RuntimeException {
    public DuplicateEmployeeException() {
        super("An employee with this work email already exists");
    }
}

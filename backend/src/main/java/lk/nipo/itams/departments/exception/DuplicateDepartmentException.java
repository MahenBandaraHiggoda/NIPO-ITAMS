package lk.nipo.itams.departments.exception;

public class DuplicateDepartmentException extends RuntimeException {
    public DuplicateDepartmentException() {
        super("A department or division with this name and type already exists");
    }
}

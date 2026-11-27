package lk.nipo.itams.employees.dto;

import lk.nipo.itams.employees.entity.Employee;
import java.time.Instant;

public record EmployeeResponse(
        Long id,
        String fullName,
        String workEmail,
        Long departmentId,
        String departmentName,
        String departmentType,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFullName(),
                employee.getWorkEmail(),
                employee.getDepartment() == null ? null : employee.getDepartment().getId(),
                employee.getDepartment() == null ? null : employee.getDepartment().getName(),
                employee.getDepartment() == null ? null : employee.getDepartment().getType(),
                employee.isActive(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}

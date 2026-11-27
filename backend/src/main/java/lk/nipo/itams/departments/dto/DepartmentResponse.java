package lk.nipo.itams.departments.dto;

import lk.nipo.itams.departments.entity.Department;
import java.time.Instant;

public record DepartmentResponse(
        Long id,
        String name,
        String type,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getType(),
                department.isActive(),
                department.getCreatedAt(),
                department.getUpdatedAt()
        );
    }
}

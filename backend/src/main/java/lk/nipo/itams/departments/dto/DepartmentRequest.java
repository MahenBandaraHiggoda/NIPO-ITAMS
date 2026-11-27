package lk.nipo.itams.departments.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Pattern(regexp = "DEPARTMENT|DIVISION", message = "Type must be DEPARTMENT or DIVISION")
        String type,
        Boolean active
) {}

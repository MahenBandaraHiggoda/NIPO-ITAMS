package lk.nipo.itams.employees.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record EmployeeRequest(
        @NotBlank @Size(max = 160) String fullName,
        @Email @Size(max = 254) String workEmail,
        @Positive Long departmentId,
        Boolean active
) {
    public EmployeeRequest {
        if (fullName != null) fullName = fullName.trim();
        if (workEmail != null) workEmail = workEmail.trim();
    }
}

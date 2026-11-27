package lk.nipo.itams.assignments.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record AssignmentRequest(
        @NotNull @Positive Long employeeId,
        @NotNull @Positive Long assetId,
        @NotNull @PastOrPresent LocalDate assignedDate
) {}

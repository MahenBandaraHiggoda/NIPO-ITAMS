package lk.nipo.itams.assignments.dto;

import java.time.LocalDate;
import lk.nipo.itams.assignments.entity.AssetAssignment;

public record AssignmentResponse(
        Long id,
        Long assetId,
        String assetCode,
        String assetName,
        String category,
        String type,
        String serialNumber,
        Long employeeId,
        String employeeName,
        LocalDate assignedDate
) {
    public static AssignmentResponse from(AssetAssignment assignment) {
        return new AssignmentResponse(
                assignment.getId(),
                assignment.getAsset().getId(),
                assignment.getAsset().getAssetCode(),
                assignment.getAsset().getAssetName(),
                assignment.getAsset().getCategory(),
                assignment.getAsset().getType(),
                assignment.getAsset().getSerialNumber(),
                assignment.getEmployee().getId(),
                assignment.getEmployee().getFullName(),
                assignment.getAssignedDate()
        );
    }
}

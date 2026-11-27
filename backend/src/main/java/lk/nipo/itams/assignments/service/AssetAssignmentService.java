package lk.nipo.itams.assignments.service;

import java.util.List;
import lk.nipo.itams.assets.entity.Asset;
import lk.nipo.itams.assets.repository.AssetRepository;
import lk.nipo.itams.assignments.dto.AssignmentRequest;
import lk.nipo.itams.assignments.dto.AssignmentResponse;
import lk.nipo.itams.assignments.entity.AssetAssignment;
import lk.nipo.itams.assignments.repository.AssetAssignmentRepository;
import lk.nipo.itams.employees.entity.Employee;
import lk.nipo.itams.employees.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AssetAssignmentService {
    private final AssetAssignmentRepository assignmentRepository;
    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    public AssetAssignmentService(
            AssetAssignmentRepository assignmentRepository,
            AssetRepository assetRepository,
            EmployeeRepository employeeRepository) {
        this.assignmentRepository = assignmentRepository;
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getCurrentAssignments(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found");
        }
        return assignmentRepository
                .findAllByEmployee_IdAndReturnedDateIsNullOrderByAssignedDateDescIdDesc(employeeId)
                .stream()
                .map(AssignmentResponse::from)
                .toList();
    }

    public AssignmentResponse assign(AssignmentRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (!employee.isActive()) {
            throw new IllegalArgumentException("Equipment can only be assigned to an active employee");
        }

        Asset asset = assetRepository.findByIdForUpdate(request.assetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
        if (!"AVAILABLE".equals(asset.getStatus())) {
            throw new IllegalArgumentException("Only available assets can be assigned");
        }
        if (assignmentRepository.existsByAsset_IdAndReturnedDateIsNull(asset.getId())) {
            throw new IllegalArgumentException("This asset already has an active assignment");
        }

        AssetAssignment assignment = new AssetAssignment();
        assignment.setAsset(asset);
        assignment.setEmployee(employee);
        assignment.setAssignedDate(request.assignedDate());
        asset.setStatus("ASSIGNED");
        assetRepository.save(asset);
        return AssignmentResponse.from(assignmentRepository.save(assignment));
    }
}

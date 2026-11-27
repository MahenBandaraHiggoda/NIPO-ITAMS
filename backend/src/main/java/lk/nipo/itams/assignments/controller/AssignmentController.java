package lk.nipo.itams.assignments.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lk.nipo.itams.assignments.dto.AssignmentRequest;
import lk.nipo.itams.assignments.dto.AssignmentResponse;
import lk.nipo.itams.assignments.service.AssetAssignmentService;
import lk.nipo.itams.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AssignmentController {
    private final AssetAssignmentService service;

    public AssignmentController(AssetAssignmentService service) {
        this.service = service;
    }

    @GetMapping("/api/employees/{employeeId}/assignments")
    public ApiResponse<List<AssignmentResponse>> getCurrentAssignments(
            @PathVariable @Positive Long employeeId) {
        return ApiResponse.ok("Current employee equipment loaded", service.getCurrentAssignments(employeeId));
    }

    @PostMapping("/api/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AssignmentResponse> assign(@Valid @RequestBody AssignmentRequest request) {
        return ApiResponse.ok("Equipment assigned successfully", service.assign(request));
    }
}

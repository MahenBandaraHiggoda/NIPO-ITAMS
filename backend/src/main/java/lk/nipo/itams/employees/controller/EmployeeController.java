package lk.nipo.itams.employees.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lk.nipo.itams.common.ApiResponse;
import lk.nipo.itams.employees.dto.EmployeeRequest;
import lk.nipo.itams.employees.dto.EmployeeResponse;
import lk.nipo.itams.employees.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<Page<EmployeeResponse>> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) @Positive Long departmentId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fullName") String sort,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction
    ) {
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("Page must be >= 0 and size must be between 1 and 100");
        }
        if (!java.util.Set.of("fullName", "workEmail", "createdAt", "updatedAt").contains(sort)) {
            throw new IllegalArgumentException("Unsupported sort field");
        }
        Page<EmployeeResponse> result = service
                .list(search, departmentId, active, PageRequest.of(page, size, Sort.by(direction, sort)));
        return ApiResponse.ok("Employees loaded", result);
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeResponse> get(@PathVariable Long id) {
        return ApiResponse.ok("Employee loaded", service.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest request) {
        return ApiResponse.ok("Employee created", service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EmployeeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request
    ) {
        return ApiResponse.ok("Employee updated", service.update(id, request));
    }
}

package lk.nipo.itams.departments.controller;

import jakarta.validation.Valid;
import lk.nipo.itams.common.ApiResponse;
import lk.nipo.itams.departments.dto.DepartmentRequest;
import lk.nipo.itams.departments.dto.DepartmentResponse;
import lk.nipo.itams.departments.service.DepartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<DepartmentResponse>> list(@RequestParam(required = false) Boolean active) {
        List<DepartmentResponse> result = service.list(active).stream()
                .map(DepartmentResponse::from)
                .toList();
        return ApiResponse.ok("Departments and divisions loaded", result);
    }

    @GetMapping("/{id}")
    public ApiResponse<DepartmentResponse> get(@PathVariable Long id) {
        return ApiResponse.ok("Department or division loaded", DepartmentResponse.from(service.get(id)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest request) {
        return ApiResponse.ok("Department or division created", DepartmentResponse.from(service.create(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<DepartmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request
    ) {
        return ApiResponse.ok("Department or division updated", DepartmentResponse.from(service.update(id, request)));
    }
}

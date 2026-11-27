package lk.nipo.itams.employees.service;

import lk.nipo.itams.departments.entity.Department;
import lk.nipo.itams.departments.service.DepartmentService;
import lk.nipo.itams.employees.dto.EmployeeRequest;
import lk.nipo.itams.employees.dto.EmployeeResponse;
import lk.nipo.itams.employees.exception.DuplicateEmployeeException;
import lk.nipo.itams.employees.entity.Employee;
import lk.nipo.itams.employees.repository.EmployeeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional
public class EmployeeService {
    private final EmployeeRepository repository;
    private final DepartmentService departmentService;

    public EmployeeService(EmployeeRepository repository, DepartmentService departmentService) {
        this.repository = repository;
        this.departmentService = departmentService;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> list(String search, Long departmentId, Boolean active, Pageable pageable) {
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        return repository.search(normalizedSearch, departmentId, active, pageable).map(EmployeeResponse::from);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Long id) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Employee not found"));
        return EmployeeResponse.from(employee);
    }

    public EmployeeResponse create(EmployeeRequest request) {
        String email = normalizeEmail(request.workEmail());
        ensureUniqueEmail(email, null);
        Employee employee = new Employee();
        apply(employee, request, email, true);
        return EmployeeResponse.from(repository.save(employee));
    }

    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = getEntity(id);
        String email = normalizeEmail(request.workEmail());
        ensureUniqueEmail(email, id);
        apply(employee, request, email, false);
        return EmployeeResponse.from(repository.save(employee));
    }

    private Employee getEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Employee not found"));
    }

    private void apply(Employee employee, EmployeeRequest request, String email, boolean creating) {
        employee.setFullName(request.fullName().trim());
        employee.setWorkEmail(email);
        if (request.departmentId() == null) {
            employee.setDepartment(null);
        } else if (creating || employee.getDepartment() == null
                || !Objects.equals(employee.getDepartment().getId(), request.departmentId())) {
            employee.setDepartment(departmentService.getActive(request.departmentId()));
        }
        if (request.active() != null) {
            employee.setActive(request.active());
        } else if (creating) {
            employee.setActive(true);
        }
    }

    private void ensureUniqueEmail(String email, Long currentId) {
        if (email == null) return;
        repository.findByWorkEmailIgnoreCase(email)
                .filter(existing -> !Objects.equals(existing.getId(), currentId))
                .ifPresent(existing -> { throw new DuplicateEmployeeException(); });
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) return null;
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

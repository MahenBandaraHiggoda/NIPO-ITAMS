package lk.nipo.itams.departments.service;

import lk.nipo.itams.departments.dto.DepartmentRequest;
import lk.nipo.itams.departments.entity.Department;
import lk.nipo.itams.departments.exception.DuplicateDepartmentException;
import lk.nipo.itams.departments.repository.DepartmentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional
public class DepartmentService {
    private static final List<String> TYPES = List.of("DEPARTMENT", "DIVISION");
    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Department> list(Boolean active) {
        return active == null
                ? repository.findAll(Sort.by("name"))
                : repository.findAllByActiveOrderByNameAsc(active);
    }

    @Transactional(readOnly = true)
    public Department get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Department or division not found"));
    }

    @Transactional(readOnly = true)
    public Department getActive(Long id) {
        Department department = get(id);
        if (!department.isActive()) {
            throw new IllegalArgumentException("Inactive departments or divisions cannot be assigned");
        }
        return department;
    }

    public Department create(DepartmentRequest request) {
        String name = request.name().trim();
        String type = normalizeType(request.type());
        ensureUnique(name, type);

        Department department = new Department();
        apply(department, request, name, type);
        return repository.save(department);
    }

    public Department update(Long id, DepartmentRequest request) {
        Department department = get(id);
        String name = request.name().trim();
        String type = normalizeType(request.type());
        repository.findByNameIgnoreCaseAndType(name, type)
                .filter(existing -> !Objects.equals(existing.getId(), id))
                .ifPresent(existing -> { throw new DuplicateDepartmentException(); });
        apply(department, request, name, type);
        return repository.save(department);
    }

    private void ensureUnique(String name, String type) {
        if (repository.existsByNameIgnoreCaseAndType(name, type)) {
            throw new DuplicateDepartmentException();
        }
    }

    private void apply(Department department, DepartmentRequest request, String name, String type) {
        department.setName(name);
        department.setType(type);
        if (request.active() != null) department.setActive(request.active());
    }

    private String normalizeType(String type) {
        String normalized = type.trim().toUpperCase(Locale.ROOT);
        if (!TYPES.contains(normalized)) {
            throw new IllegalArgumentException("Type must be DEPARTMENT or DIVISION");
        }
        return normalized;
    }
}

package lk.nipo.itams.departments.service;

import lk.nipo.itams.departments.dto.DepartmentRequest;
import lk.nipo.itams.departments.entity.Department;
import lk.nipo.itams.departments.repository.DepartmentRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DepartmentServiceTest {
    private final DepartmentRepository repository = mock(DepartmentRepository.class);
    private final DepartmentService service = new DepartmentService(repository);

    @Test
    void trimsNameAndNormalizesTypeOnCreate() {
        when(repository.existsByNameIgnoreCaseAndType("Information Technology", "DIVISION")).thenReturn(false);
        when(repository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Department department = service.create(new DepartmentRequest(" Information Technology ", "division", null));

        assertEquals("Information Technology", department.getName());
        assertEquals("DIVISION", department.getType());
        assertTrue(department.isActive());
    }

    @Test
    void rejectsDuplicateNameAndType() {
        when(repository.existsByNameIgnoreCaseAndType("Human Resources", "DEPARTMENT")).thenReturn(true);

        assertThrows(lk.nipo.itams.departments.exception.DuplicateDepartmentException.class,
                () -> service.create(new DepartmentRequest("Human Resources", "DEPARTMENT", null)));
        verify(repository, never()).save(any());
    }
}

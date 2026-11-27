package lk.nipo.itams.employees.service;

import lk.nipo.itams.departments.entity.Department;
import lk.nipo.itams.departments.repository.DepartmentRepository;
import lk.nipo.itams.departments.service.DepartmentService;
import lk.nipo.itams.employees.dto.EmployeeRequest;
import lk.nipo.itams.employees.dto.EmployeeResponse;
import lk.nipo.itams.employees.entity.Employee;
import lk.nipo.itams.employees.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {
    private final EmployeeRepository repository = mock(EmployeeRepository.class);
    private final DepartmentRepository departmentRepository = mock(DepartmentRepository.class);
    private final EmployeeService service = new EmployeeService(
            repository, new DepartmentService(departmentRepository));

    @Test
    void trimsNameAndNormalizesEmailOnCreate() {
        when(repository.findByWorkEmailIgnoreCase("samadhi@example.org")).thenReturn(Optional.empty());
        when(repository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EmployeeResponse employee = service.create(new EmployeeRequest(" Samadhi Dewmini ", " Samadhi@Example.org ", null, null));

        assertEquals("Samadhi Dewmini", employee.fullName());
        assertEquals("samadhi@example.org", employee.workEmail());
        assertTrue(employee.active());
    }

    @Test
    void rejectsDuplicateWorkEmail() {
        Employee existing = new Employee();
        existing.setFullName("Existing Employee");
        org.springframework.test.util.ReflectionTestUtils.setField(existing, "id", 42L);
        when(repository.findByWorkEmailIgnoreCase("samadhi@example.org")).thenReturn(Optional.of(existing));

        assertThrows(lk.nipo.itams.employees.exception.DuplicateEmployeeException.class,
                () -> service.create(new EmployeeRequest("New Employee", "samadhi@example.org", null, null)));
        verify(repository, never()).save(any());
    }

    @Test
    void rejectsAssignmentToInactiveDepartment() {
        Department department = new Department();
        department.setName("Human Resources");
        department.setType("DEPARTMENT");
        department.setActive(false);
        when(departmentRepository.findById(3L)).thenReturn(Optional.of(department));

        assertThrows(IllegalArgumentException.class,
                () -> service.create(new EmployeeRequest("New Employee", null, 3L, null)));
        verify(repository, never()).save(any());
    }

    @Test
    void allowsKeepingAnExistingInactiveDepartmentWhenUpdatingEmployee() {
        Department department = new Department();
        department.setName("Human Resources");
        department.setType("DEPARTMENT");
        department.setActive(false);
        org.springframework.test.util.ReflectionTestUtils.setField(department, "id", 3L);

        Employee existing = new Employee();
        existing.setFullName("Existing Employee");
        existing.setDepartment(department);
        org.springframework.test.util.ReflectionTestUtils.setField(existing, "id", 42L);
        when(repository.findById(42L)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        EmployeeResponse updated = service.update(
                42L, new EmployeeRequest("Updated Employee", null, 3L, true));

        assertEquals(3L, updated.departmentId());
        assertEquals("Updated Employee", updated.fullName());
        verify(departmentRepository, never()).findById(any());
    }
}

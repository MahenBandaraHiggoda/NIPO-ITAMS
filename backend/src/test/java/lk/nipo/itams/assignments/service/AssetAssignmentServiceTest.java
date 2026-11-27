package lk.nipo.itams.assignments.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import lk.nipo.itams.assets.entity.Asset;
import lk.nipo.itams.assets.repository.AssetRepository;
import lk.nipo.itams.assignments.dto.AssignmentRequest;
import lk.nipo.itams.assignments.entity.AssetAssignment;
import lk.nipo.itams.assignments.repository.AssetAssignmentRepository;
import lk.nipo.itams.employees.entity.Employee;
import lk.nipo.itams.employees.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AssetAssignmentServiceTest {
    private final AssetAssignmentRepository assignmentRepository = org.mockito.Mockito.mock(AssetAssignmentRepository.class);
    private final AssetRepository assetRepository = org.mockito.Mockito.mock(AssetRepository.class);
    private final EmployeeRepository employeeRepository = org.mockito.Mockito.mock(EmployeeRepository.class);
    private final AssetAssignmentService service = new AssetAssignmentService(
            assignmentRepository, assetRepository, employeeRepository);

    @Test
    void assignsAvailableAssetAndMarksItAssigned() {
        Employee employee = new Employee();
        employee.setFullName("Samadhi Dewmini");
        ReflectionTestUtils.setField(employee, "id", 2L);
        Asset asset = new Asset();
        asset.setAssetCode("NIPO-01");
        asset.setAssetName("Laptop");
        asset.setStatus("AVAILABLE");
        ReflectionTestUtils.setField(asset, "id", 4L);
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(assetRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(asset));
        when(assignmentRepository.save(any(AssetAssignment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.assign(new AssignmentRequest(2L, 4L, LocalDate.now()));

        assertEquals("ASSIGNED", asset.getStatus());
        assertEquals("NIPO-01", response.assetCode());
        assertEquals("Samadhi Dewmini", response.employeeName());
        verify(assetRepository).save(asset);
    }

    @Test
    void rejectsInactiveEmployeesAndDoesNotSaveAnAssignment() {
        Employee employee = new Employee();
        employee.setFullName("Inactive Employee");
        employee.setActive(false);
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        assertThrows(IllegalArgumentException.class,
                () -> service.assign(new AssignmentRequest(2L, 4L, LocalDate.now())));

        verify(assetRepository, never()).findByIdForUpdate(4L);
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void rejectsAssetsThatAreNotAvailable() {
        Employee employee = new Employee();
        Asset asset = new Asset();
        asset.setStatus("ASSIGNED");
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(assetRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(asset));

        assertThrows(IllegalArgumentException.class,
                () -> service.assign(new AssignmentRequest(2L, 4L, LocalDate.now())));

        verify(assetRepository, never()).save(any());
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void rejectsAssetsWithAnExistingCurrentAssignment() {
        Employee employee = new Employee();
        ReflectionTestUtils.setField(employee, "id", 2L);
        Asset asset = new Asset();
        asset.setStatus("AVAILABLE");
        ReflectionTestUtils.setField(asset, "id", 4L);
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(assetRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(asset));
        when(assignmentRepository.existsByAsset_IdAndReturnedDateIsNull(4L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.assign(new AssignmentRequest(2L, 4L, LocalDate.now())));

        verify(assetRepository, never()).save(any());
        verify(assignmentRepository, never()).save(any());
    }
}

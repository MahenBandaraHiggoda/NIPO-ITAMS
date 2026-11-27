package lk.nipo.itams.assets.service;

import lk.nipo.itams.assets.dto.AssetRequest;
import lk.nipo.itams.assets.entity.Asset;
import lk.nipo.itams.assets.repository.AssetRepository;
import lk.nipo.itams.assignments.repository.AssetAssignmentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AssetServiceTest {
    private final AssetRepository repository = mock(AssetRepository.class);
    private final AssetAssignmentRepository assignmentRepository = mock(AssetAssignmentRepository.class);
    private final AssetService service = new AssetService(repository, assignmentRepository);

    @Test
    void trimsSearchAndValidatesStatusBeforeQuery() {
        when(repository.search(eq("laptop"), eq("AVAILABLE"), any())).thenReturn(new PageImpl<>(List.of()));
        service.list(" laptop ", "available", PageRequest.of(0, 10));
        verify(repository).search("laptop", "AVAILABLE", PageRequest.of(0, 10));
    }

    @Test
    void rejectsUnsupportedStatus() {
        assertThrows(IllegalArgumentException.class, () -> service.list(null, "LOST", PageRequest.of(0, 10)));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsDuplicateAssetCode() {
        Asset existing = new Asset(); existing.setAssetCode("NIPO-01"); existing.setAssetName("Existing");
        ReflectionTestUtils.setField(existing, "id", 42L);
        when(repository.findByAssetCodeIgnoreCase("nipo-01")).thenReturn(Optional.of(existing));
        when(repository.findBySerialNumberIgnoreCase("NEW-1")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.create(request(" nipo-01 ", "NEW-1")));
        verify(repository, never()).save(any());
    }

    @Test
    void doesNotAllowChangingAnActivelyAssignedAssetBackToAvailable() {
        Asset assigned = new Asset();
        assigned.setAssetCode("NIPO-01");
        assigned.setAssetName("Laptop");
        assigned.setStatus("ASSIGNED");
        when(repository.findById(42L)).thenReturn(Optional.of(assigned));
        when(assignmentRepository.existsByAsset_IdAndReturnedDateIsNull(42L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.update(42L, request("NIPO-01", "SERIAL-1")));

        verify(repository, never()).save(any());
    }

    private AssetRequest request(String code, String serial) {
        return new AssetRequest(code, "Test asset", null, null, null, null, serial, null,
                new BigDecimal("1.00"), null, null, null, null, null, "AVAILABLE", null);
    }
}

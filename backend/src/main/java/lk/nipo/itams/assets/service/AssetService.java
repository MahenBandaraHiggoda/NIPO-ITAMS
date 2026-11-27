package lk.nipo.itams.assets.service;

import lk.nipo.itams.assets.dto.AssetRequest;
import lk.nipo.itams.assets.entity.Asset;
import lk.nipo.itams.assets.exception.DuplicateAssetException;
import lk.nipo.itams.assets.repository.AssetRepository;
import lk.nipo.itams.assignments.repository.AssetAssignmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AssetService {
    private static final String[] STATUSES = {"ACTIVE", "AVAILABLE", "ASSIGNED", "UNDER_MAINTENANCE", "RETIRED"};
    private final AssetRepository repository;
    private final AssetAssignmentRepository assignmentRepository;

    public AssetService(AssetRepository repository, AssetAssignmentRepository assignmentRepository) {
        this.repository = repository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public Page<Asset> list(String search, String status, Pageable pageable) {
        String normalizedStatus = status == null || status.isBlank() ? null : status.trim().toUpperCase();
        if (normalizedStatus != null && !java.util.Arrays.asList(STATUSES).contains(normalizedStatus))
            throw new IllegalArgumentException("Unsupported asset status");
        String normalizedSearch = search == null || search.isBlank() ? null : search.trim();
        return repository.search(normalizedSearch, normalizedStatus, pageable);
    }

    @Transactional(readOnly = true)
    public Asset get(Long id) { return repository.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Asset not found")); }

    public Asset create(AssetRequest request) {
        ensureUnique(request, null);
        Asset asset = new Asset();
        apply(asset, request);
        return repository.save(asset);
    }

    public Asset update(Long id, AssetRequest request) {
        Asset asset = get(id);
        boolean hasCurrentAssignment = assignmentRepository.existsByAsset_IdAndReturnedDateIsNull(id);
        if (hasCurrentAssignment
                && request.status() != null
                && !"ASSIGNED".equalsIgnoreCase(request.status())) {
            throw new IllegalArgumentException("An assigned asset must be returned before its status can change");
        }
        ensureUnique(request, id);
        apply(asset, request);
        if (hasCurrentAssignment) asset.setStatus("ASSIGNED");
        return repository.save(asset);
    }

    public Asset retire(Long id) {
        Asset asset = get(id);
        asset.setStatus("RETIRED");
        return repository.save(asset);
    }

    private void ensureUnique(AssetRequest request, Long currentId) {
        boolean duplicateCode = repository.findByAssetCodeIgnoreCase(request.assetCode().trim())
                .filter(a -> !java.util.Objects.equals(a.getId(), currentId)).isPresent();
        boolean duplicateSerial = request.serialNumber() != null && !request.serialNumber().isBlank()
                && repository.findBySerialNumberIgnoreCase(request.serialNumber().trim())
                .filter(a -> !java.util.Objects.equals(a.getId(), currentId)).isPresent();
        if (duplicateCode || duplicateSerial) throw new DuplicateAssetException();
    }

    private void apply(Asset a, AssetRequest r) {
        a.setAssetCode(r.assetCode().trim()); a.setAssetName(r.assetName().trim());
        a.setCategory(blankToNull(r.category())); a.setType(blankToNull(r.type()));
        a.setBrand(blankToNull(r.brand())); a.setModel(blankToNull(r.model()));
        a.setSerialNumber(blankToNull(r.serialNumber())); a.setPurchaseDate(r.purchaseDate());
        a.setPurchaseCost(r.purchaseCost()); a.setSupplier(blankToNull(r.supplier()));
        a.setWarrantyStart(r.warrantyStart()); a.setWarrantyExpiry(r.warrantyExpiry());
        a.setLocation(blankToNull(r.location())); a.setDepartment(blankToNull(r.department()));
        if (r.status() != null && !r.status().isBlank()) a.setStatus(r.status().toUpperCase());
        a.setDescription(blankToNull(r.description()));
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}

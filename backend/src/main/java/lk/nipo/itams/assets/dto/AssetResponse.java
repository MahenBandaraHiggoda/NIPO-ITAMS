package lk.nipo.itams.assets.dto;

import lk.nipo.itams.assets.entity.Asset;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record AssetResponse(Long id, String assetCode, String assetName, String category, String type,
        String brand, String model, String serialNumber, LocalDate purchaseDate, BigDecimal purchaseCost,
        String supplier, LocalDate warrantyStart, LocalDate warrantyExpiry, String location,
        String department, String status, String description, Instant createdAt, Instant updatedAt) {
    public static AssetResponse from(Asset a) {
        return new AssetResponse(a.getId(), a.getAssetCode(), a.getAssetName(), a.getCategory(), a.getType(),
                a.getBrand(), a.getModel(), a.getSerialNumber(), a.getPurchaseDate(), a.getPurchaseCost(),
                a.getSupplier(), a.getWarrantyStart(), a.getWarrantyExpiry(), a.getLocation(), a.getDepartment(),
                a.getStatus(), a.getDescription(), a.getCreatedAt(), a.getUpdatedAt());
    }
}

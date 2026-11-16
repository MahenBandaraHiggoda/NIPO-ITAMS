package lk.nipo.itams.assets.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetRequest(
        @NotBlank @Size(max = 40) String assetCode,
        @NotBlank @Size(max = 160) String assetName,
        @Size(max = 80) String category,
        @Size(max = 80) String type,
        @Size(max = 100) String brand,
        @Size(max = 100) String model,
        @Size(max = 100) String serialNumber,
        LocalDate purchaseDate,
        @DecimalMin(value = "0.00") @Digits(integer = 12, fraction = 2) BigDecimal purchaseCost,
        @Size(max = 120) String supplier,
        LocalDate warrantyStart,
        LocalDate warrantyExpiry,
        @Size(max = 120) String location,
        @Size(max = 120) String department,
        @Pattern(regexp = "ACTIVE|AVAILABLE|ASSIGNED|UNDER_MAINTENANCE|RETIRED", message = "Unsupported asset status") String status,
        @Size(max = 2000) String description
) {}

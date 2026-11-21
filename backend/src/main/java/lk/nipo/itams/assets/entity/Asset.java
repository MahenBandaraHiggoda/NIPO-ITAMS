package lk.nipo.itams.assets.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "asset")
public class Asset {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "asset_code", nullable = false, unique = true, length = 40) private String assetCode;
    @Column(name = "asset_name", nullable = false, length = 160) private String assetName;
    @Column(length = 80) private String category;
    @Column(name = "asset_type", length = 80) private String type;
    @Column(length = 100) private String brand;
    @Column(length = 100) private String model;
    @Column(name = "serial_number", unique = true, length = 100) private String serialNumber;
    @Column(name = "purchase_date") private LocalDate purchaseDate;
    @Column(name = "purchase_cost", precision = 14, scale = 2) private BigDecimal purchaseCost;
    @Column(length = 120) private String supplier;
    @Column(name = "warranty_start") private LocalDate warrantyStart;
    @Column(name = "warranty_expiry") private LocalDate warrantyExpiry;
    @Column(length = 120) private String location;
    @Column(length = 120) private String department;
    @Column(nullable = false, length = 32) private String status = "AVAILABLE";
    @Column(length = 2000) private String description;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    @PrePersist void onCreate() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
    public Long getId() { return id; }
    public String getAssetCode() { return assetCode; }
    public void setAssetCode(String v) { assetCode = v; }
    public String getAssetName() { return assetName; }
    public void setAssetName(String v) { assetName = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { category = v; }
    public String getType() { return type; }
    public void setType(String v) { type = v; }
    public String getBrand() { return brand; }
    public void setBrand(String v) { brand = v; }
    public String getModel() { return model; }
    public void setModel(String v) { model = v; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String v) { serialNumber = v; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate v) { purchaseDate = v; }
    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal v) { purchaseCost = v; }
    public String getSupplier() { return supplier; }
    public void setSupplier(String v) { supplier = v; }
    public LocalDate getWarrantyStart() { return warrantyStart; }
    public void setWarrantyStart(LocalDate v) { warrantyStart = v; }
    public LocalDate getWarrantyExpiry() { return warrantyExpiry; }
    public void setWarrantyExpiry(LocalDate v) { warrantyExpiry = v; }
    public String getLocation() { return location; }
    public void setLocation(String v) { location = v; }
    public String getDepartment() { return department; }
    public void setDepartment(String v) { department = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { description = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

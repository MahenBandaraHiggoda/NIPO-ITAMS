package lk.nipo.itams.assets.repository;

import lk.nipo.itams.assets.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Asset a where a.id = :id")
    Optional<Asset> findByIdForUpdate(@Param("id") Long id);

    @Query("""
        select a from Asset a where (:status is null or a.status = :status)
        and (:search is null or lower(a.assetCode) like lower(concat('%', :search, '%'))
        or lower(a.assetName) like lower(concat('%', :search, '%'))
        or lower(coalesce(a.serialNumber, '')) like lower(concat('%', :search, '%'))
        or lower(coalesce(a.category, '')) like lower(concat('%', :search, '%')))
        """)
    Page<Asset> search(@Param("search") String search, @Param("status") String status, Pageable pageable);
    long countByStatus(String status);
    boolean existsByAssetCodeIgnoreCase(String assetCode);
    boolean existsBySerialNumberIgnoreCase(String serialNumber);
    Optional<Asset> findByAssetCodeIgnoreCase(String assetCode);
    Optional<Asset> findBySerialNumberIgnoreCase(String serialNumber);
}

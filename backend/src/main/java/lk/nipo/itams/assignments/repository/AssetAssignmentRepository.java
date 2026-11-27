package lk.nipo.itams.assignments.repository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import lk.nipo.itams.assignments.entity.AssetAssignment;

public interface AssetAssignmentRepository extends JpaRepository<AssetAssignment, Long> {
    boolean existsByAsset_IdAndReturnedDateIsNull(Long assetId);

    @EntityGraph(attributePaths = {"asset", "employee"})
    List<AssetAssignment> findAllByEmployee_IdAndReturnedDateIsNullOrderByAssignedDateDescIdDesc(
            Long employeeId);
}

package lk.nipo.itams.departments.repository;

import lk.nipo.itams.departments.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findAllByOrderByNameAsc();
    List<Department> findAllByActiveOrderByNameAsc(boolean active);
    boolean existsByNameIgnoreCaseAndType(String name, String type);
    Optional<Department> findByNameIgnoreCaseAndType(String name, String type);
}

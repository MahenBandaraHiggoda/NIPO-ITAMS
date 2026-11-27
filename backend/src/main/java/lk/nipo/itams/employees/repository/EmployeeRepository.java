package lk.nipo.itams.employees.repository;

import lk.nipo.itams.employees.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @EntityGraph(attributePaths = "department")
    @Query("""
        select e from Employee e left join e.department d
        where (:search is null or lower(e.fullName) like lower(concat('%', :search, '%'))
        or lower(coalesce(e.workEmail, '')) like lower(concat('%', :search, '%'))
        or lower(coalesce(d.name, '')) like lower(concat('%', :search, '%')))
        and (:departmentId is null or d.id = :departmentId)
        and (:active is null or e.active = :active)
        """)
    Page<Employee> search(
            @Param("search") String search,
            @Param("departmentId") Long departmentId,
            @Param("active") Boolean active,
            Pageable pageable
    );

    Optional<Employee> findByWorkEmailIgnoreCase(String workEmail);
}

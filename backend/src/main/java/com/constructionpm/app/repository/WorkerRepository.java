package com.constructionpm.app.repository;

import com.constructionpm.app.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
    Optional<Worker> findByEmployeeId(String employeeId);
    List<Worker> findByStatus(Worker.WorkerStatus status);
    List<Worker> findByActiveTrue();
    long countByStatus(Worker.WorkerStatus status);
    boolean existsByEmployeeId(String employeeId);
}

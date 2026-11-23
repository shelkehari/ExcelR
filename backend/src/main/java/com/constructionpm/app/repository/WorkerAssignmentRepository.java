package com.constructionpm.app.repository;

import com.constructionpm.app.entity.WorkerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface WorkerAssignmentRepository extends JpaRepository<WorkerAssignment, Long> {
    List<WorkerAssignment> findByProjectId(Long projectId);
    List<WorkerAssignment> findByWorkerIdAndStatus(Long workerId, WorkerAssignment.AssignmentStatus status);
    Optional<WorkerAssignment> findByWorkerIdAndProjectIdAndStatus(Long workerId, Long projectId, WorkerAssignment.AssignmentStatus status);

    @Query("SELECT COUNT(wa) FROM WorkerAssignment wa WHERE wa.project.id = :projectId AND wa.status = 'ACTIVE'")
    long countActiveByProjectId(Long projectId);
}

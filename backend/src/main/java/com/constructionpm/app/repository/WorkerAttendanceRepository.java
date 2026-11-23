package com.constructionpm.app.repository;

import com.constructionpm.app.entity.WorkerAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkerAttendanceRepository extends JpaRepository<WorkerAttendance, Long> {
    List<WorkerAttendance> findByProjectIdAndAttendanceDate(Long projectId, LocalDate date);
    List<WorkerAttendance> findByWorkerIdOrderByAttendanceDateDesc(Long workerId);
    Optional<WorkerAttendance> findByWorkerIdAndProjectIdAndAttendanceDate(Long workerId, Long projectId, LocalDate date);
}

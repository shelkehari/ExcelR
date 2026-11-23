package com.constructionpm.app.service;

import com.constructionpm.app.dto.WorkerDto;
import com.constructionpm.app.entity.*;
import com.constructionpm.app.exception.BusinessException;
import com.constructionpm.app.exception.ResourceNotFoundException;
import com.constructionpm.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkerService {

    private final WorkerRepository workerRepo;
    private final WorkerAssignmentRepository assignmentRepo;
    private final WorkerAttendanceRepository attendanceRepo;
    private final ProjectRepository projectRepo;

    public List<WorkerDto> getAllWorkers() {
        return workerRepo.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public WorkerDto getWorker(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public WorkerDto createWorker(WorkerDto dto) {
        if (workerRepo.existsByEmployeeId(dto.getEmployeeId()))
            throw new BusinessException("Employee ID already exists: " + dto.getEmployeeId());
        Worker worker = Worker.builder()
                .name(dto.getName()).employeeId(dto.getEmployeeId()).trade(dto.getTrade())
                .phone(dto.getPhone()).email(dto.getEmail())
                .type(dto.getType() != null ? dto.getType() : Worker.WorkerType.EMPLOYEE)
                .joiningDate(dto.getJoiningDate()).dailyWage(dto.getDailyWage())
                .build();
        return toDto(workerRepo.save(worker));
    }

    @Transactional
    public WorkerDto updateWorker(Long id, WorkerDto dto) {
        Worker worker = findById(id);
        worker.setName(dto.getName()); worker.setTrade(dto.getTrade());
        worker.setPhone(dto.getPhone()); worker.setEmail(dto.getEmail());
        worker.setDailyWage(dto.getDailyWage());
        if (dto.getStatus() != null) worker.setStatus(dto.getStatus());
        return toDto(workerRepo.save(worker));
    }

    @Transactional
    public WorkerAssignment assignWorker(Long workerId, Long projectId, String role) {
        Worker worker = findById(workerId);
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assignmentRepo.findByWorkerIdAndProjectIdAndStatus(workerId, projectId, WorkerAssignment.AssignmentStatus.ACTIVE)
                .ifPresent(a -> { throw new BusinessException("Worker already assigned to this project"); });
        worker.setStatus(Worker.WorkerStatus.ASSIGNED);
        workerRepo.save(worker);
        return assignmentRepo.save(WorkerAssignment.builder()
                .worker(worker).project(project).role(role)
                .assignedDate(LocalDate.now()).build());
    }

    @Transactional
    public void releaseWorker(Long assignmentId) {
        WorkerAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", assignmentId));
        assignment.setStatus(WorkerAssignment.AssignmentStatus.RELEASED);
        assignment.setReleasedDate(LocalDate.now());
        assignmentRepo.save(assignment);
        boolean stillAssigned = !assignmentRepo.findByWorkerIdAndStatus(
                assignment.getWorker().getId(), WorkerAssignment.AssignmentStatus.ACTIVE).isEmpty();
        if (!stillAssigned) {
            assignment.getWorker().setStatus(Worker.WorkerStatus.AVAILABLE);
            workerRepo.save(assignment.getWorker());
        }
    }

    @Transactional
    public WorkerAttendance recordAttendance(Long workerId, Long projectId,
                                              LocalDate date, WorkerAttendance.AttendanceStatus status, String notes) {
        attendanceRepo.findByWorkerIdAndProjectIdAndAttendanceDate(workerId, projectId, date)
                .ifPresent(a -> { throw new BusinessException("Attendance already recorded for this date"); });
        Worker worker = findById(workerId);
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        return attendanceRepo.save(WorkerAttendance.builder()
                .worker(worker).project(project).attendanceDate(date).status(status).notes(notes).build());
    }

    public List<WorkerAssignment> getProjectAssignments(Long projectId) {
        return assignmentRepo.findByProjectId(projectId);
    }

    private Worker findById(Long id) {
        return workerRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Worker", id));
    }

    public WorkerDto toDto(Worker w) {
        WorkerDto dto = new WorkerDto();
        dto.setId(w.getId()); dto.setName(w.getName()); dto.setEmployeeId(w.getEmployeeId());
        dto.setTrade(w.getTrade()); dto.setPhone(w.getPhone()); dto.setEmail(w.getEmail());
        dto.setStatus(w.getStatus()); dto.setType(w.getType());
        dto.setJoiningDate(w.getJoiningDate()); dto.setDailyWage(w.getDailyWage());
        dto.setActive(w.isActive()); dto.setCreatedAt(w.getCreatedAt());
        return dto;
    }
}

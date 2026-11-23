package com.constructionpm.app.dto;

import com.constructionpm.app.entity.Worker;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WorkerDto {
    private Long id;
    @NotBlank private String name;
    @NotBlank private String employeeId;
    @NotBlank private String trade;
    private String phone;
    private String email;
    private Worker.WorkerStatus status;
    private Worker.WorkerType type;
    private LocalDate joiningDate;
    @NotNull private BigDecimal dailyWage;
    private boolean active;
    private LocalDateTime createdAt;
}

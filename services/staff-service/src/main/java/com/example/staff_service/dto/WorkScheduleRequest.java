package com.example.staff_service.dto;

import com.example.staff_service.entity.ScheduleStatus;
import com.example.staff_service.entity.ScheduleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleRequest {

    private Long staffId;
    private Long flightId;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
    private ScheduleType scheduleType;
    private ScheduleStatus status;
    private String location;
    private String notes;
}



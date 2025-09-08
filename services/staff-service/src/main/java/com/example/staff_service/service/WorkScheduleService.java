package com.example.staff_service.service;

import com.example.staff_service.dto.WorkScheduleRequest;
import com.example.staff_service.dto.WorkScheduleResponse;
import com.example.staff_service.entity.ScheduleStatus;
import com.example.staff_service.entity.ScheduleType;
import com.example.staff_service.entity.WorkSchedule;
import com.example.staff_service.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepository repository;

    public WorkScheduleResponse create(WorkScheduleRequest request) {
        WorkSchedule schedule = toEntity(request);
        WorkSchedule saved = repository.save(schedule);
        return toResponse(saved);
    }

    public WorkScheduleResponse update(Long id, WorkScheduleRequest request) {
        WorkSchedule existing = repository.findById(id).orElseThrow();
        existing.setStaffId(request.getStaffId());
        existing.setScheduleDate(request.getScheduleDate());
        existing.setStartTime(request.getStartTime());
        existing.setEndTime(request.getEndTime());
        existing.setBreakStartTime(request.getBreakStartTime());
        existing.setBreakEndTime(request.getBreakEndTime());
        existing.setScheduleType(request.getScheduleType());
        existing.setStatus(request.getStatus());
        existing.setLocation(request.getLocation());
        existing.setNotes(request.getNotes());
        existing.setFlightId(request.getFlightId());
        return toResponse(repository.save(existing));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public WorkScheduleResponse getById(Long id) {
        return repository.findById(id).map(this::toResponse).orElseThrow();
    }

    public List<WorkScheduleResponse> getByStaff(Long staffId) {
        return repository.findByStaffId(staffId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkScheduleResponse> getByDate(LocalDate date) {
        return repository.findByScheduleDate(date).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkScheduleResponse> getByDateRange(LocalDate start, LocalDate end) {
        return repository.findByScheduleDateBetween(start, end).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkScheduleResponse> getByStatus(ScheduleStatus status) {
        return repository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkScheduleResponse> getByType(ScheduleType type) {
        return repository.findByScheduleType(type).stream().map(this::toResponse).collect(Collectors.toList());
    }
    
    public List<WorkScheduleResponse> getByFlight(Long flightId) {
        return repository.findByFlightId(flightId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<WorkScheduleResponse> getLatestByStaff(Long staffId, int page, int size) {
        return repository.findLatestByStaffId(staffId, PageRequest.of(page, size)).map(this::toResponse);
    }

    public List<WorkScheduleResponse> getUpcomingByStaff(Long staffId) {
        return repository.findUpcomingByStaffId(staffId, LocalDate.now()).stream().map(this::toResponse).collect(Collectors.toList());
    }

    private WorkSchedule toEntity(WorkScheduleRequest request) {
        return WorkSchedule.builder()
                .staffId(request.getStaffId())
                .flightId(request.getFlightId())
                .scheduleDate(request.getScheduleDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .breakStartTime(request.getBreakStartTime())
                .breakEndTime(request.getBreakEndTime())
                .scheduleType(request.getScheduleType())
                .status(request.getStatus())
                .location(request.getLocation())
                .notes(request.getNotes())
                .build();
    }

    private WorkScheduleResponse toResponse(WorkSchedule schedule) {
        return WorkScheduleResponse.builder()
                .id(schedule.getId())
                .staffId(schedule.getStaffId())
                .flightId(schedule.getFlightId())
                .scheduleDate(schedule.getScheduleDate())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .breakStartTime(schedule.getBreakStartTime())
                .breakEndTime(schedule.getBreakEndTime())
                .scheduleType(schedule.getScheduleType())
                .status(schedule.getStatus())
                .location(schedule.getLocation())
                .notes(schedule.getNotes())
                .actualStartTime(schedule.getActualStartTime())
                .actualEndTime(schedule.getActualEndTime())
                .overtimeHours(schedule.getOvertimeHours())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
}



import api from "@/lib/axios-config"

export type ScheduleStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "MODIFIED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"

export type ScheduleType =
  | "REGULAR"
  | "OVERTIME"
  | "NIGHT_SHIFT"
  | "WEEKEND"
  | "HOLIDAY"
  | "ON_CALL"
  | "TRAINING"
  | "MEETING"
  | "BREAK"
  | "LEAVE"
  | "SICK_LEAVE"
  | "VACATION"

export interface WorkSchedule {
  id: number
  staffId: number
  flightId?: number
  scheduleDate: string
  startTime?: string
  endTime?: string
  breakStartTime?: string
  breakEndTime?: string
  scheduleType: ScheduleType
  status: ScheduleStatus
  location?: string
  notes?: string
  actualStartTime?: string
  actualEndTime?: string
  overtimeHours?: number
  createdAt: string
  updatedAt: string
}

export interface WorkScheduleRequest {
  staffId: number
  flightId?: number
  scheduleDate: string
  startTime?: string
  endTime?: string
  breakStartTime?: string
  breakEndTime?: string
  scheduleType: ScheduleType
  status: ScheduleStatus
  location?: string
  notes?: string
}

class ScheduleService {
  async createSchedule(payload: WorkScheduleRequest): Promise<WorkSchedule> {
    const res = await api.post("/schedules", payload)
    return res.data
  }

  async updateSchedule(id: number, payload: WorkScheduleRequest): Promise<WorkSchedule> {
    const res = await api.put(`/schedules/${id}`, payload)
    return res.data
  }

  async deleteSchedule(id: number): Promise<void> {
    await api.delete(`/schedules/${id}`)
  }

  async getScheduleById(id: number): Promise<WorkSchedule> {
    const res = await api.get(`/schedules/${id}`)
    return res.data
  }

  async getSchedulesByStaff(staffId: number): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/staff/${staffId}`)
    return res.data
  }

  async getSchedulesByDate(date: string): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/date/${date}`)
    return res.data
  }

  async getSchedulesByDateRange(startDate: string, endDate: string): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/date-range?startDate=${startDate}&endDate=${endDate}`)
    return res.data
  }

  async getSchedulesByStatus(status: ScheduleStatus): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/status/${status}`)
    return res.data
  }

  async getSchedulesByType(type: ScheduleType): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/type/${type}`)
    return res.data
  }

  async getUpcomingByStaff(staffId: number): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/staff/${staffId}/upcoming`)
    return res.data
  }

  async getSchedulesByFlight(flightId: number): Promise<WorkSchedule[]> {
    const res = await api.get(`/schedules/flight/${flightId}`)
    return res.data
  }
}

export const scheduleService = new ScheduleService()
export default scheduleService



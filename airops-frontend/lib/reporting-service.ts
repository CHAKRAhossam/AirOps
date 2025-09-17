import api from "@/lib/axios-config"

export interface FlightReport {
  totalFlights: number
  byStatus: Record<string, number>
  byAirline: Record<string, number>
  sample: any[]
}

export interface StaffReport {
  content: any[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ReportFilters {
  period?: string
  startDate?: string
  endDate?: string
  department?: string
  status?: string
}

export interface RealTimeMetrics {
  activeFlights: number
  delayedFlights: number
  cancelledFlights: number
  activeStaff: number
  systemHealth: string
  lastUpdated: string
}

export interface PerformanceTrends {
  flightPerformance: Array<{
    month: string
    onTime: number
    delayed: number
    cancelled: number
    total: number
  }>
  staffPerformance: Array<{
    month: string
    active: number
    onLeave: number
    performance: number
  }>
  revenue: Array<{
    month: string
    revenue: number
    costs: number
    profit: number
  }>
}

export interface ExportResponse {
  message: string
  type: string
  format: string
  period: string
  timestamp: string
}

class ReportingService {
  // Get flight reports with optional filters
  async getFlightReports(filters?: ReportFilters): Promise<FlightReport> {
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const response = await api.get(`/reports/flights?${params.toString()}`)
    return response.data
  }

  // Get staff reports with optional filters
  async getStaffReports(filters?: ReportFilters): Promise<StaffReport> {
    const params = new URLSearchParams()
    if (filters?.period) params.append('period', filters.period)
    if (filters?.department) params.append('department', filters.department)
    if (filters?.status) params.append('status', filters.status)

    const response = await api.get(`/reports/staff?${params.toString()}`)
    return response.data
  }

  // Get comprehensive dashboard data
  async getDashboardData(filters?: ReportFilters): Promise<{
    flights: FlightReport
    staff: StaffReport
  }> {
    const [flights, staff] = await Promise.all([
      this.getFlightReports(filters),
      this.getStaffReports(filters)
    ])

    return { flights, staff }
  }

  // Export report data
  async exportReport(
      reportType: 'flights' | 'staff' | 'dashboard',
      format: 'pdf' | 'excel',
      filters?: ReportFilters
  ): Promise<ExportResponse> {
    const params = new URLSearchParams()
    params.append('format', format)
    if (filters?.period) params.append('period', filters.period)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.department) params.append('department', filters.department)
    if (filters?.status) params.append('status', filters.status)

    const response = await api.get(`/reports/${reportType}/export?${params.toString()}`)
    return response.data
  }

  // Get real-time metrics
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const response = await api.get('/reports/metrics/realtime')
    return response.data
  }

  // Get performance trends
  async getPerformanceTrends(period: string = '6months'): Promise<PerformanceTrends> {
    const response = await api.get(`/reports/trends?period=${period}`)
    return response.data
  }
}

export const reportingService = new ReportingService()
export default reportingService
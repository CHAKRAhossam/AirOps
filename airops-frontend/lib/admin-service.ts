import api from "@/lib/axios-config"

export interface ServiceHealth {
  name: string
  status: "UP" | "DOWN" | string
}

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

class AdminService {
  async getUsersCount(): Promise<number> {
    const res = await api.get("/auth/users/count")
    return res.data
  }

  async getServiceHealth(): Promise<ServiceHealth[]> {
    const services = [
      { key: "auth-service", name: "Auth Service" },
      { key: "staff-service", name: "Staff Service" },
      { key: "flight-service", name: "Flight Service" },
      { key: "reporting-service", name: "Reporting Service" },
      { key: "chat-service", name: "Chat Service" },
      { key: "gateway", name: "Gateway" },
    ]

    const results = await Promise.all(
      services.map(async (s) => {
        try {
          // Through gateway: /actuator/health on each service ID via lb:// routing by predicate
          const url = s.key === "gateway" ? "/actuator/health" : `/${s.key}/actuator/health`
          const res = await api.get(url)
          return { name: s.name, status: res.data.status as string }
        } catch {
          return { name: s.name, status: "DOWN" }
        }
      })
    )

    return results
  }

  async getSystemLoad(): Promise<number | null> {
    try {
      // Prefer system load average (1m). Falls back to process CPU usage if not available
      const load = await api.get("/actuator/metrics/system.load.average.1m")
      const value = load.data?.measurements?.find((m: any) => m.statistic === "VALUE")?.value
      if (typeof value === "number") return value
    } catch {}
    try {
      const cpu = await api.get("/actuator/metrics/process.cpu.usage")
      const value = cpu.data?.measurements?.find((m: any) => m.statistic === "VALUE")?.value
      if (typeof value === "number") return value
    } catch {}
    return null
  }

  async getApiCalls(): Promise<number | null> {
    try {
      const res = await api.get("/actuator/metrics/http.server.requests")
      const count = res.data?.measurements?.find((m: any) => m.statistic === "COUNT")?.value
      if (typeof count === "number") return count
      return null
    } catch {
      return null
    }
  }

  async getUsers(): Promise<AdminUser[]> {
    const res = await api.get("/auth/users")
    return res.data as AdminUser[]
  }

  async getRoles(): Promise<string[]> {
    const res = await api.get("/auth/roles")
    return res.data as string[]
  }

  async getGatewayRoutes(): Promise<any[]> {
    const res = await api.get("/actuator/gateway/routes")
    return res.data as any[]
  }

  async getHealthRaw(serviceKey: string): Promise<any> {
    const url = serviceKey === "gateway" ? "/actuator/health" : `/${serviceKey}/actuator/health`
    const res = await api.get(url)
    return res.data
  }

  async getAuthoritiesForRole(role: string): Promise<string[]> {
    const res = await api.get(`/auth/roles/${encodeURIComponent(role)}/authorities`)
    return res.data as string[]
  }

  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const res = await api.put(`/auth/users/${encodeURIComponent(userId)}/role`, undefined, { params: { role } })
    return res.data as AdminUser
  }
}

export const adminService = new AdminService()
export default adminService



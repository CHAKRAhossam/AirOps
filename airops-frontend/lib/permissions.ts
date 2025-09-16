import type { UserRole } from "@/contexts/auth-context"

export type FlightPermissions = {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export function getFlightPermissions(role: UserRole | undefined | null): FlightPermissions {
  switch (role) {
    case "ADMIN":
      return { canCreate: true, canUpdate: true, canDelete: true }
    case "SUPERVISEUR":
      // Supervisor: create and update, no delete
      return { canCreate: true, canUpdate: true, canDelete: false }
    case "AGENT":
      // Agent: read-only
      return { canCreate: false, canUpdate: false, canDelete: false }
    default:
      return { canCreate: false, canUpdate: false, canDelete: false }
  }
}



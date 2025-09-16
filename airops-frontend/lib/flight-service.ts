import api from "@/lib/axios-config"

export interface FlightStatus {
  id: string;
  displayName: string;
}

export interface Flight {
  id: number;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  status: FlightStatus;
  aircraftType: string;
  pilotId: string;
  coPilotId: string;
  crewMembers: string;
  passengerCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlightRequest {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  status: string;
  aircraftType: string;
  pilotId?: string;
  coPilotId?: string;
  crewMembers?: string;
  passengerCount?: number;
  notes?: string;
}

export interface UpdateFlightRequest extends CreateFlightRequest {
  id: number;
}

export interface FlightStatusRequest {
  status: string;
}

export interface FlightListResponse {
  content: Flight[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class FlightService {
  // Get all flights
  async getAllFlights(): Promise<Flight[]> {
    const response = await api.get('/flights')
    return response.data
  }

  // Get flight by ID
  async getFlightById(id: number): Promise<Flight> {
    const response = await api.get(`/flights/${id}`)
    return response.data
  }

  // Create new flight
  async createFlight(flightData: CreateFlightRequest): Promise<Flight> {
    const response = await api.post('/flights', flightData)
    return response.data
  }

  // Update flight
  async updateFlight(id: number, flightData: CreateFlightRequest): Promise<Flight> {
    const response = await api.put(`/flights/${id}`, flightData)
    return response.data
  }

  // Update flight status
  async updateFlightStatus(id: number, statusRequest: FlightStatusRequest): Promise<any> {
    const response = await api.put(`/flights/${id}/status`, statusRequest)
    return response.data
  }

  // Delete flight
  async deleteFlight(id: number): Promise<void> {
    await api.delete(`/flights/${id}`)
  }

  // Get flights by status
  async getFlightsByStatus(status: string): Promise<Flight[]> {
    const response = await api.get(`/flights/status/${status}`)
    return response.data
  }

  // Get flights by airline
  async getFlightsByAirline(airline: string): Promise<Flight[]> {
    const response = await api.get(`/flights/airline/${airline}`)
    return response.data
  }

  // Get all available flight statuses
  async getAllFlightStatuses(): Promise<FlightStatus[]> {
    const response = await api.get('/flights/statuses')
    const statuses = response.data
    
    // Transform the enum values to match our interface
    return statuses.map((status: string) => ({
      id: status,
      displayName: this.getStatusDisplayName(status)
    }))
  }

  // Helper methods to get display names
  private getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'Programmé',
      'BOARDING': 'Embarquement',
      'DELAYED': 'Retardé',
      'CANCELLED': 'Annulé',
      'LANDED': 'Atterri',
      'DEPARTED': 'Décollé',
      'ARRIVED': 'Arrivé'
    };
    return statusMap[status] || status;
  }
}

export const flightService = new FlightService();
export default flightService;



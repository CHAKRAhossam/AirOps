"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plane, Save, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getFlightPermissions } from "@/lib/permissions"
import { flightService, Flight, FlightStatus, CreateFlightRequest } from "@/lib/flight-service"
import { useToast } from "@/hooks/use-toast"

interface FlightFormProps {
  flight?: Flight
  onSave: (data: CreateFlightRequest) => void
  onCancel: () => void
}

const airlines = [
  "American Airlines",
  "United Airlines",
  "Delta Airlines",
  "Southwest Airlines",
  "JetBlue Airways",
  "Alaska Airlines",
  "Spirit Airlines",
  "Frontier Airlines",
]

const airports = [
  { code: "JFK", name: "John F. Kennedy International Airport" },
  { code: "LAX", name: "Los Angeles International Airport" },
  { code: "ORD", name: "O'Hare International Airport" },
  { code: "MIA", name: "Miami International Airport" },
  { code: "BOS", name: "Logan International Airport" },
  { code: "SFO", name: "San Francisco International Airport" },
  { code: "DEN", name: "Denver International Airport" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International Airport" },
]

const aircraftTypes = [
  "Boeing 737",
  "Boeing 757",
  "Boeing 767",
  "Boeing 777",
  "Boeing 787",
  "Airbus A320",
  "Airbus A321",
  "Airbus A330",
  "Airbus A350",
]

export function FlightForm({ flight, onSave, onCancel }: FlightFormProps) {
  const { token, user } = useAuth()
  const perms = getFlightPermissions(user?.role)
  const { toast } = useToast()
  const [flightStatuses, setFlightStatuses] = useState<FlightStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAirline, setSelectedAirline] = useState(flight?.airline || "")
  const [selectedOrigin, setSelectedOrigin] = useState(flight?.origin || "")
  const [selectedDestination, setSelectedDestination] = useState(flight?.destination || "")
  const [selectedAircraft, setSelectedAircraft] = useState(flight?.aircraftType || "")
  const [selectedStatus, setSelectedStatus] = useState<string>(flight?.status?.id || "SCHEDULED")
  const [error, setError] = useState<string | null>(null)

  // Set authentication token in flight service
  // Token is now handled automatically by axios interceptor

  // Load flight statuses
  useEffect(() => {
    const loadFlightStatuses = async () => {
      if (!token) return

      try {
        const statuses = await flightService.getAllFlightStatuses()
        // Filter out any statuses with empty or invalid IDs
        const validStatuses = statuses.filter(status => status.id && status.id.trim() !== "")
        setFlightStatuses(validStatuses)
      } catch (error) {
        console.error("Failed to load flight statuses:", error)
        // Set default statuses if API fails
        setFlightStatuses([
          { id: "SCHEDULED", displayName: "Scheduled" },
          { id: "BOARDING", displayName: "Boarding" },
          { id: "DEPARTED", displayName: "Departed" },
          { id: "ARRIVED", displayName: "Arrived" },
          { id: "DELAYED", displayName: "Delayed" },
          { id: "CANCELLED", displayName: "Cancelled" }
        ])
      }
    }

    loadFlightStatuses()
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFlightRequest>({
    defaultValues: flight
        ? {
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
          gate: flight.gate,
          aircraftType: flight.aircraftType,
          pilotId: flight.pilotId || "",
          coPilotId: flight.coPilotId || "",
          crewMembers: flight.crewMembers || "",
          passengerCount: flight.passengerCount || 0,
          notes: flight.notes || "",
        }
        : {
          status: "SCHEDULED",
          passengerCount: 0,
        },
  })

  const onSubmit = async (data: CreateFlightRequest) => {
    try {
      setLoading(true)
      setError(null)

      // Combine date and time for departure and arrival
      const departureDateTime = new Date(`${data.departureDate}T${data.departureTime}`)
      const arrivalDateTime = new Date(`${data.arrivalDate}T${data.arrivalTime}`)

      // Validate that arrival is after departure
      if (arrivalDateTime <= departureDateTime) {
        setError("Arrival time must be after departure time")
        setLoading(false)
        return
      }

      // Prepare the flight data for the API
      const formData: CreateFlightRequest = {
        flightNumber: data.flightNumber,
        airline: selectedAirline,
        origin: selectedOrigin,
        destination: selectedDestination,
        departureTime: departureDateTime.toISOString(),
        arrivalTime: arrivalDateTime.toISOString(),
        gate: data.gate,
        status: selectedStatus,
        aircraftType: selectedAircraft,
        pilotId: data.pilotId || "",
        coPilotId: data.coPilotId || "",
        crewMembers: data.crewMembers || "",
        passengerCount: data.passengerCount || 0,
        notes: data.notes || "",
      }

      onSave(formData)
    } catch (err) {
      setError("Failed to save flight. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save flight",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{flight ? "Edit Flight" : "Create New Flight"}</h2>
              <p className="text-gray-600">{flight ? "Update flight information" : "Add a new flight to the schedule"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Flight identification and airline details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                      id="flightNumber"
                      name="flightNumber"
                      placeholder="AA123"
                      autocomplete="off"
                      {...register("flightNumber", { required: "Flight number is required" })}
                  />
                  {errors.flightNumber && <p className="text-sm text-red-600">{errors.flightNumber.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="airline-select">Airline</Label>
                  <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                    <SelectTrigger id="airline-select" name="airline">
                      <SelectValue placeholder="Select airline" />
                    </SelectTrigger>
                    <SelectContent>
                      {airlines.map((airline) => (
                          <SelectItem key={airline} value={airline}>
                            {airline}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aircraft-select">Aircraft Type</Label>
                  <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                    <SelectTrigger id="aircraft-select" name="aircraftType">
                      <SelectValue placeholder="Select aircraft" />
                    </SelectTrigger>
                    <SelectContent>
                      {aircraftTypes.map((aircraft) => (
                          <SelectItem key={aircraft} value={aircraft}>
                            {aircraft}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengerCount">Passenger Count</Label>
                  <Input
                      id="passengerCount"
                      name="passengerCount"
                      type="number"
                      placeholder="180"
                      autocomplete="off"
                      {...register("passengerCount", {
                        required: "Passenger count is required",
                        min: { value: 0, message: "Must be at least 0" },
                      })}
                  />
                  {errors.passengerCount && <p className="text-sm text-red-600">{errors.passengerCount.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>Origin and destination details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin-select">Origin Airport</Label>
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger id="origin-select" name="origin">
                      <SelectValue placeholder="Select origin" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.code} - {airport.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination-select">Destination Airport</Label>
                  <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                    <SelectTrigger id="destination-select" name="destination">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.code} - {airport.name}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gate">Gate</Label>
                <Input
                    id="gate"
                    name="gate"
                    placeholder="A12"
                    autocomplete="off"
                    {...register("gate", { required: "Gate is required" })}
                />
                {errors.gate && <p className="text-sm text-red-600">{errors.gate.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Information</CardTitle>
              <CardDescription>Departure and arrival times</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                      id="departureDate"
                      name="departureDate"
                      type="date"
                      autocomplete="off"
                      {...register("departureDate", { required: "Departure date is required" })}
                  />
                  {errors.departureDate && <p className="text-sm text-red-600">{errors.departureDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                      id="departureTime"
                      name="departureTime"
                      type="time"
                      autocomplete="off"
                      {...register("departureTime", { required: "Departure time is required" })}
                  />
                  {errors.departureTime && <p className="text-sm text-red-600">{errors.departureTime.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Arrival Date</Label>
                  <Input
                      id="arrivalDate"
                      name="arrivalDate"
                      type="date"
                      autocomplete="off"
                      {...register("arrivalDate", { required: "Arrival date is required" })}
                  />
                  {errors.arrivalDate && <p className="text-sm text-red-600">{errors.arrivalDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <Input
                      id="arrivalTime"
                      name="arrivalTime"
                      type="time"
                      autocomplete="off"
                      {...register("arrivalTime", { required: "Arrival time is required" })}
                  />
                  {errors.arrivalTime && <p className="text-sm text-red-600">{errors.arrivalTime.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crew Information */}
          <Card>
            <CardHeader>
              <CardTitle>Crew Information</CardTitle>
              <CardDescription>Pilot and crew assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pilotId">Pilot ID</Label>
                  <Input
                      id="pilotId"
                      name="pilotId"
                      placeholder="PILOT001"
                      autocomplete="off"
                      {...register("pilotId")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coPilotId">Co-Pilot ID</Label>
                  <Input
                      id="coPilotId"
                      name="coPilotId"
                      placeholder="COPILOT001"
                      autocomplete="off"
                      {...register("coPilotId")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crewMembers">Crew Members</Label>
                <Input
                    id="crewMembers"
                    name="crewMembers"
                    placeholder="FA001, FA002, FA003"
                    autocomplete="off"
                    {...register("crewMembers")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status and Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Notes</CardTitle>
              <CardDescription>Flight status and additional information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status-select">Flight Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-select" name="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {flightStatuses.length > 0 ? (
                        flightStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.displayName}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="loading-placeholder" disabled>
                          Loading statuses...
                        </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional flight information or special instructions..."
                    {...register("notes")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {(flight ? perms.canUpdate : perms.canCreate) && (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : (flight ? "Update Flight" : "Create Flight")}
              </Button>
            )}
          </div>
        </form>
      </div>
  )
}
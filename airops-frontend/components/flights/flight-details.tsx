"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plane,
  Clock,
  MapPin,
  Users,
  Edit,
  ArrowLeft,
  Calendar,
  Settings,
  AlertTriangle,
  Trash2,
  User,
  UserCheck,
  Briefcase,
  Info,
  Navigation
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getFlightPermissions } from "@/lib/permissions"

interface Flight {
  id: number
  flightNumber: string
  airline: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  status: {
    id: string
    displayName: string
  }
  aircraftType: string
  gate: string
  passengerCount: number
  pilotId?: string
  coPilotId?: string
  crewMembers?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface FlightDetailsProps {
  flight: Flight
  onEdit: () => void
  onBack: () => void
  onDelete: () => void
}

export function FlightDetails({ flight, onEdit, onBack, onDelete }: FlightDetailsProps) {
  const { user } = useAuth()
  const perms = getFlightPermissions(user?.role)
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "outline"
      case "BOARDING":
        return "default"
      case "DEPARTED":
        return "secondary"
      case "ARRIVED":
        return "secondary"
      case "DELAYED":
        return "destructive"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "text-blue-600 bg-blue-50"
      case "BOARDING":
        return "text-green-600 bg-green-50"
      case "DEPARTED":
        return "text-purple-600 bg-purple-50"
      case "ARRIVED":
        return "text-gray-600 bg-gray-50"
      case "DELAYED":
        return "text-orange-600 bg-orange-50"
      case "CANCELLED":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  const departure = formatDateTime(flight.departureTime)
  const arrival = formatDateTime(flight.arrivalTime)

  // Calculate flight duration
  const calculateDuration = () => {
    const dep = new Date(flight.departureTime)
    const arr = new Date(flight.arrivalTime)
    const diffMs = arr.getTime() - dep.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Mock crew data
  const crew = [
    { name: flight.pilotId || "Captain Smith", role: "PILOT", status: "ASSIGNED" },
    { name: flight.coPilotId || "First Officer Johnson", role: "CO_PILOT", status: "ASSIGNED" },
    { name: "Sarah Wilson", role: "FLIGHT_ATTENDANT", status: "ASSIGNED" },
    { name: "Mike Brown", role: "FLIGHT_ATTENDANT", status: "ASSIGNED" },
  ]

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${getStatusColor(flight.status.id)}`}>
                <Plane className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">Flight {flight.flightNumber}</h1>
                  <Badge
                      variant={getStatusBadgeVariant(flight.status.id)}
                      className="text-sm px-3 py-1"
                  >
                    {flight.status.displayName}
                  </Badge>
                </div>
                <p className="text-lg text-gray-600">{flight.airline}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Duration: {calculateDuration()}</span>
                  <span>•</span>
                  <span>Aircraft: {flight.aircraftType}</span>
                  <span>•</span>
                  <span>Gate: {flight.gate}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={onBack} variant="outline" className="hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              {perms.canUpdate && (
                <Button onClick={onEdit} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Flight
                </Button>
              )}
              {perms.canDelete && (
                <Button onClick={onDelete} variant="destructive" className="hover:bg-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                  Flight Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <div className="text-3xl font-bold text-blue-900">{flight.origin}</div>
                        <div className="text-sm text-blue-600 font-medium">Origin</div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{departure.date}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-bold text-lg">{departure.time}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>Gate {flight.gate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center px-8">
                      <div className="flex items-center space-x-2">
                        <div className="h-px bg-gray-300 w-16"></div>
                        <div className="bg-blue-600 text-white p-2 rounded-full">
                          <Plane className="h-5 w-5" />
                        </div>
                        <div className="h-px bg-gray-300 w-16"></div>
                      </div>
                    </div>

                    <div className="text-center flex-1">
                      <div className="bg-green-50 rounded-lg p-4 mb-3">
                        <div className="text-3xl font-bold text-green-900">{flight.destination}</div>
                        <div className="text-sm text-green-600 font-medium">Destination</div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{arrival.date}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-bold text-lg">{arrival.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flight Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aircraft Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plane className="h-5 w-5 mr-2 text-gray-600" />
                    Aircraft Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-semibold">{flight.aircraftType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gate:</span>
                    <span className="font-semibold">{flight.gate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-semibold">{calculateDuration()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Passenger Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-600" />
                    Passenger Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">{flight.passengerCount || 0}</div>
                    <div className="text-sm text-gray-500">Total Passengers</div>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((flight.passengerCount || 0) / 200 * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    Estimated capacity utilization
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            {flight.notes && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-gray-600" />
                      Flight Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{flight.notes}</p>
                  </CardContent>
                </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Crew Assignment */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-gray-600" />
                  Crew Assignment
                </CardTitle>
                <CardDescription>Current crew members assigned to this flight</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {crew.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-full">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {member.role.replace('_', ' ').toLowerCase()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {member.status}
                      </Badge>
                    </div>
                ))}
                <Separator />
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Crew
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-orange-50 hover:text-orange-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Delay Flight
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-green-50 hover:text-green-700">
                  <MapPin className="h-4 w-4 mr-2" />
                  Change Gate
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Assign Crew
                </Button>
                <Separator />
                <Button variant="destructive" size="sm" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancel Flight
                </Button>
              </CardContent>
            </Card>

            {/* Flight Timeline */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Flight Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="text-sm">
                      <div className="font-medium">Scheduled Departure</div>
                      <div className="text-gray-500">{departure.time} - {departure.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="text-sm">
                      <div className="font-medium">Estimated Arrival</div>
                      <div className="text-gray-500">{arrival.time} - {arrival.date}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Flight ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">#{flight.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-xs">{new Date(flight.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-xs">{new Date(flight.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plane, Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, Clock, MapPin, Loader2, RefreshCw, Download, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getFlightPermissions } from "@/lib/permissions"
import { flightService, Flight, FlightStatus } from "@/lib/flight-service"
import { useToast } from "@/hooks/use-toast"

interface FlightListProps {
  onCreateFlight: () => void
  onEditFlight: (flight: Flight) => void
  onViewFlight: (flight: Flight) => void
}

export function FlightList({ onCreateFlight, onEditFlight, onViewFlight }: FlightListProps) {
  const { token, user } = useAuth()
  const { toast } = useToast()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlights, setSelectedFlights] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [airlineFilter, setAirlineFilter] = useState<string>("all")

  // Token is now handled automatically by axios interceptor

  // Load flights data
  const loadFlights = async (showRefreshing = false) => {
    if (!token) {
      setError("Authentication required")
      setLoading(false)
      return
    }

    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      const flightsData = await flightService.getAllFlights()
      setFlights(flightsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flights')
      toast({
        title: "Error",
        description: "Failed to load flights",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFlights()
  }, [token, toast])

  const handleRefresh = () => {
    loadFlights(true)
    toast({
      title: "Refreshing",
      description: "Loading latest flight data...",
    })
  }

  const getStatusBadgeVariant = (status: FlightStatus) => {
    switch (status.id) {
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

  const filteredFlights = flights.filter((flight) => {
    const matchesSearch =
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (flight.airline && flight.airline.toLowerCase().includes(searchTerm.toLowerCase())) ||
        flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || flight.status.id === statusFilter
    const matchesAirline = airlineFilter === "all" || flight.airline === airlineFilter

    return matchesSearch && matchesStatus && matchesAirline
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFlights(filteredFlights.map((f) => f.id.toString()))
    } else {
      setSelectedFlights([])
    }
  }

  const handleSelectFlight = (flightId: string, checked: boolean) => {
    if (checked) {
      setSelectedFlights([...selectedFlights, flightId])
    } else {
      setSelectedFlights(selectedFlights.filter((id) => id !== flightId))
    }
  }

  const handleDeleteFlight = async (flightId: number) => {
    if (!confirm('Are you sure you want to delete this flight?')) {
      return
    }

    try {
      await flightService.deleteFlight(flightId)
      toast({
        title: "Success",
        description: "Flight deleted successfully",
      })
      // Reload flights
      const updatedFlights = await flightService.getAllFlights()
      setFlights(updatedFlights)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete flight",
        variant: "destructive",
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Filter out empty airlines and create unique list
  const airlines = Array.from(new Set(
      flights
          .map((f) => f.airline)
          .filter((airline) => airline && airline.trim() !== "") // Remove empty/null airlines
  ))

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Loading flights...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your flight data</p>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="text-red-600 mb-2">
                <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium mb-1">Error loading flights</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={() => loadFlights()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
    )
  }

  const perms = getFlightPermissions(user?.role)

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Flight Management</h2>
              <p className="text-gray-600 mt-1">Manage flight schedules and operations</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-600 text-sm font-medium">Total Flights</div>
              <div className="text-2xl font-bold text-blue-900">{flights.length}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-green-600 text-sm font-medium">On Schedule</div>
              <div className="text-2xl font-bold text-green-900">
                {flights.filter(f => f.status.id === 'SCHEDULED').length}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-orange-600 text-sm font-medium">Delayed</div>
              <div className="text-2xl font-bold text-orange-900">
                {flights.filter(f => f.status.id === 'DELAYED').length}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 text-sm font-medium">Cancelled</div>
              <div className="text-2xl font-bold text-red-900">
                {flights.filter(f => f.status.id === 'CANCELLED').length}
              </div>
            </div>
          </div>
        </div>



        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    id="search-flights"
                    name="searchTerm"
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                    autoComplete="off"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" name="statusFilter" className="h-10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="BOARDING">Boarding</SelectItem>
                  <SelectItem value="DEPARTED">Departed</SelectItem>
                  <SelectItem value="ARRIVED">Arrived</SelectItem>
                  <SelectItem value="DELAYED">Delayed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={airlineFilter} onValueChange={setAirlineFilter}>
                <SelectTrigger id="airline-filter" name="airlineFilter" className="h-10">
                  <SelectValue placeholder="Filter by airline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Airlines</SelectItem>
                  {airlines.length > 0 ? (
                      airlines.map((airline) => (
                          <SelectItem key={airline} value={airline}>
                            {airline}
                          </SelectItem>
                      ))
                  ) : (
                      <SelectItem value="no-airlines" disabled>
                        No airlines available
                      </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">
                  {filteredFlights.length} of {flights.length} flights
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedFlights.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {selectedFlights.length}
                    </div>
                    <span className="text-sm text-blue-800 font-medium">
                      flight{selectedFlights.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <Settings className="h-4 w-4 mr-1" />
                      Update Status
                    </Button>
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      <MapPin className="h-4 w-4 mr-1" />
                      Assign Crew
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Cancel Flights
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Flight Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flight List ({filteredFlights.length})
              </CardTitle>
              {perms.canCreate && (
                <Button onClick={onCreateFlight}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flight
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                          checked={selectedFlights.length === filteredFlights.length && filteredFlights.length > 0}
                          onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Flight</TableHead>
                    <TableHead className="font-semibold">Route</TableHead>
                    <TableHead className="font-semibold">Schedule</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Aircraft</TableHead>
                    <TableHead className="font-semibold">Gate</TableHead>
                    <TableHead className="font-semibold">Passengers</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlights.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <div className="text-gray-500">
                            <Plane className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No flights found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : (
                      filteredFlights.map((flight) => (
                          <TableRow key={flight.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell>
                              <Checkbox
                                  checked={selectedFlights.includes(flight.id.toString())}
                                  onCheckedChange={(checked) => handleSelectFlight(flight.id.toString(), checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-semibold text-gray-900">{flight.flightNumber}</div>
                                <div className="text-sm text-gray-500">{flight.airline || "No airline"}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900">{flight.origin}</div>
                                  <div className="text-xs text-gray-500">{formatDate(flight.departureTime)}</div>
                                </div>
                                <div className="flex-shrink-0">
                                  <Plane className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="text-center">
                                  <div className="font-semibold text-gray-900">{flight.destination}</div>
                                  <div className="text-xs text-gray-500">{formatDate(flight.arrivalTime)}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-sm">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium">Dep:</span>
                                  <span>{formatTime(flight.departureTime)}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium">Arr:</span>
                                  <span>{formatTime(flight.arrivalTime)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                  variant={getStatusBadgeVariant(flight.status)}
                                  className="font-medium"
                              >
                                {flight.status.displayName}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-gray-900">{flight.aircraftType}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-sm font-medium">{flight.gate}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <span className="font-semibold text-gray-900">{flight.passengerCount || 0}</span>
                                <span className="text-gray-500 ml-1">pax</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => onViewFlight(flight)}>
                                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                    View Details
                                  </DropdownMenuItem>
                                  {perms.canUpdate && (
                                    <DropdownMenuItem onClick={() => onEditFlight(flight)}>
                                      <Edit className="h-4 w-4 mr-2 text-green-600" />
                                      Edit Flight
                                    </DropdownMenuItem>
                                  )}
                                  {perms.canDelete && (
                                    <DropdownMenuItem
                                        onClick={() => handleDeleteFlight(flight.id)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Flight
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
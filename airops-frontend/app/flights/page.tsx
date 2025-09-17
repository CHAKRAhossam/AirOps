"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { FlightList } from "@/components/flights/flight-list"
import { FlightForm } from "@/components/flights/flight-form"
import { FlightDetails } from "@/components/flights/flight-details"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { flightService, Flight, CreateFlightRequest } from "@/lib/flight-service"
import { useToast } from "@/hooks/use-toast"

export default function FlightsPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [flightView, setFlightView] = useState<"list" | "form" | "details">("list")
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Token is now handled automatically by axios interceptor

  if (!user) {
    return null // Will redirect
  }

  const handleCreateFlight = () => {
    setSelectedFlight(null)
    setFlightView("form")
  }

  const handleEditFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setFlightView("form")
  }

  const handleViewFlight = (flight: Flight) => {
    setSelectedFlight(flight)
    setFlightView("details")
  }

  const handleSaveFlight = async (data: CreateFlightRequest) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (selectedFlight) {
        // Update existing flight
        await flightService.updateFlight(selectedFlight.id, data)
        toast({
          title: "Success",
          description: "Flight updated successfully",
        })
      } else {
        // Create new flight
        await flightService.createFlight(data)
        toast({
          title: "Success",
          description: "Flight created successfully",
        })
      }
      setFlightView("list")
      setSelectedFlight(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save flight"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelForm = () => {
    setSelectedFlight(null)
    setFlightView("list")
  }

  const handleDeleteFlight = async () => {
    if (!selectedFlight) return

    if (confirm("Are you sure you want to delete this flight?")) {
      try {
        await flightService.deleteFlight(selectedFlight.id)
        toast({
          title: "Success",
          description: "Flight deleted successfully",
        })
        setFlightView("list")
        setSelectedFlight(null)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete flight",
          variant: "destructive",
        })
      }
    }
  }

  const renderFlightView = () => {
    switch (flightView) {
      case "form":
        return (
            <FlightForm
                flight={selectedFlight}
                onSave={handleSaveFlight}
                onCancel={handleCancelForm}
            />
        )
      case "details":
        return (
            <FlightDetails
                flight={selectedFlight}
                onEdit={() => handleEditFlight(selectedFlight)}
                onBack={() => setFlightView("list")}
                onDelete={handleDeleteFlight}
            />
        )
      default:
        return (
            <FlightList
                onCreateFlight={handleCreateFlight}
                onEditFlight={handleEditFlight}
                onViewFlight={handleViewFlight}
            />
        )
    }
  }

  return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {renderFlightView()}
            </div>
          </main>
        </div>
      </div>
  )
}
"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { StaffList } from "@/components/staff/staff-list"
import { StaffForm } from "@/components/staff/staff-form"
import { StaffDetails } from "@/components/staff/staff-details"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { staffService, StaffMember, CreateStaffRequest } from "@/lib/staff-service"
import { useToast } from "@/hooks/use-toast"

export default function StaffPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [staffView, setStaffView] = useState<"list" | "form" | "details">("list")
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
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

  const handleCreateStaff = () => {
    console.log("handleCreateStaff called");
    console.log("Current staffView:", staffView);
    console.log("Current selectedStaff:", selectedStaff);
    setSelectedStaff(null)
    setStaffView("form")
    console.log("staffView set to form");
    console.log("State should now be updated");
  }

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setStaffView("form")
  }

  const handleViewStaff = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setStaffView("details")
  }

  const handleSaveStaff = async (data: CreateStaffRequest) => {
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
      if (selectedStaff) {
        // Update existing staff
        await staffService.updateStaff(selectedStaff.id, data)
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        })
      } else {
        // Create new staff
        await staffService.createStaff(data)
        toast({
          title: "Success",
          description: "Staff member created successfully",
        })
      }
      setStaffView("list")
      setSelectedStaff(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save staff member"
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
    setSelectedStaff(null)
    setStaffView("list")
  }

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return

    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffService.deleteStaff(selectedStaff.id)
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        })
        setStaffView("list")
        setSelectedStaff(null)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete staff member",
          variant: "destructive",
        })
      }
    }
  }

  const renderStaffView = () => {
    console.log("renderStaffView called with staffView:", staffView);
    console.log("selectedStaff:", selectedStaff);

    switch (staffView) {
      case "form":
        console.log("Rendering StaffForm");
        return (
            <StaffForm
                staff={selectedStaff}
                onSave={handleSaveStaff}
                onCancel={handleCancelForm}
            />
        )
      case "details":
        console.log("Rendering StaffDetails");
        return (
            <StaffDetails
                staff={selectedStaff!}
                onEdit={() => handleEditStaff(selectedStaff!)}
                onBack={() => setStaffView("list")}
                onDelete={handleDeleteStaff}
            />
        )
      default:
        console.log("Rendering StaffList");
        return (
            <StaffList
                onCreateStaff={handleCreateStaff}
                onEditStaff={handleEditStaff}
                onViewStaff={handleViewStaff}
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
              {renderStaffView()}
            </div>
          </main>
        </div>
      </div>
  )
}
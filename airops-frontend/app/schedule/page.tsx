"use client"

import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Clock, Users } from "lucide-react"
import scheduleService, { type WorkSchedule, type ScheduleType, type ScheduleStatus } from "@/lib/schedule-service"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SchedulePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])

  const [open, setOpen] = useState(false)
  const [formDate, setFormDate] = useState("")
  const [formStart, setFormStart] = useState("")
  const [formEnd, setFormEnd] = useState("")
  const [formType, setFormType] = useState<ScheduleType>("REGULAR")
  const [formStatus, setFormStatus] = useState<ScheduleStatus>("SCHEDULED")
  const [formLocation, setFormLocation] = useState("")
  const [formFlightId, setFormFlightId] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null // Will redirect
  }

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const data = await scheduleService.getUpcomingByStaff(Number(user.id))
        setSchedules(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const totalSchedules = schedules.length
  const activeSchedules = schedules.filter(s => s.status === 'IN_PROGRESS').length
  const uniqueStaffCount = useMemo(() => new Set(schedules.map(s => s.staffId)).size, [schedules])

  const handleCreate = async () => {
    if (!user || !formDate) return
    const payload = {
      staffId: Number(user.id),
      flightId: formFlightId ? Number(formFlightId) : undefined,
      scheduleDate: formDate,
      startTime: formStart || undefined,
      endTime: formEnd || undefined,
      scheduleType: formType,
      status: formStatus,
      location: formLocation || undefined,
      notes: undefined,
    }
    await scheduleService.createSchedule(payload)
    // Refresh list
    const data = await scheduleService.getUpcomingByStaff(Number(user.id))
    setSchedules(data)
    setOpen(false)
    // reset
    setFormDate("")
    setFormStart("")
    setFormEnd("")
    setFormType("REGULAR")
    setFormStatus("SCHEDULED")
    setFormLocation("")
    setFormFlightId("")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Schedule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="Terminal 1" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="flightId">Flight ID (optional)</Label>
                        <Input id="flightId" type="number" value={formFlightId} onChange={(e) => setFormFlightId(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start">Start Time</Label>
                        <Input id="start" type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end">End Time</Label>
                        <Input id="end" type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={formType} onValueChange={(v) => setFormType(v as ScheduleType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "REGULAR","OVERTIME","NIGHT_SHIFT","WEEKEND","HOLIDAY","ON_CALL","TRAINING","MEETING","BREAK","LEAVE","SICK_LEAVE","VACATION"
                            ].map(t => (
                              <SelectItem key={t} value={t}>{t.replaceAll('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ScheduleStatus)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {["SCHEDULED","IN_PROGRESS","COMPLETED","CANCELLED","MODIFIED","PENDING_APPROVAL","APPROVED","REJECTED"].map(s => (
                              <SelectItem key={s} value={s}>{s.replaceAll('_', ' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreate} disabled={!formDate}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '—' : totalSchedules}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '—' : activeSchedules}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Staff Assigned</p>
                    <p className="text-2xl font-bold text-gray-900">{loading ? '—' : uniqueStaffCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <WeeklySchedule schedules={schedules} />

            {/* Recent/Upcoming Schedules */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Schedules</h2>
              <div className="space-y-3">
                {loading && <div className="text-gray-500">Loading schedules...</div>}
                {!loading && schedules.length === 0 && (
                  <div className="text-gray-500">No upcoming schedules.</div>
                )}
                {!loading && schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{s.scheduleType.replaceAll('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{s.scheduleDate}{s.startTime ? `, ${s.startTime} - ${s.endTime ?? ''}` : ''}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  return new Date(d.setDate(diff))
}

function formatDateISO(date: Date) {
  return date.toISOString().slice(0, 10)
}

function WeeklySchedule({ schedules }: { schedules: WorkSchedule[] }) {
  const today = new Date()
  const weekStart = startOfWeek(today)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const schedulesByDay = days.map((d) => {
    const key = formatDateISO(d)
    return schedules.filter((s) => s.scheduleDate === key)
  })

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => (
          <div key={idx} className="border rounded-lg p-2 bg-gray-50 min-h-[140px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{dayNames[idx]}</span>
              <span className="text-xs text-gray-500">{d.toLocaleDateString()}</span>
            </div>
            <div className="space-y-2">
              {schedulesByDay[idx].length === 0 && (
                <div className="text-xs text-gray-400">No schedules</div>
              )}
              {schedulesByDay[idx].map((s) => (
                <div key={s.id} className="text-xs bg-white border rounded-md p-2">
                  <div className="font-medium text-gray-900">{s.scheduleType.replaceAll('_', ' ')}</div>
                  <div className="text-gray-600">{s.startTime ? `${s.startTime} - ${s.endTime ?? ''}` : 'All day'}</div>
                  {s.flightId && (
                    <div className="text-blue-700">Flight #{s.flightId}</div>
                  )}
                  <div className="text-[10px] mt-1 px-1 py-0.5 inline-block rounded bg-blue-100 text-blue-800">{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

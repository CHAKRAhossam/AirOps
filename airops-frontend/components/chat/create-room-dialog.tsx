"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { chatService, CreateRoomRequest, ChatUser } from "@/lib/chat-service"
import { toast } from "@/hooks/use-toast"

interface CreateRoomDialogProps {
  onRoomCreated: () => void
}

export function CreateRoomDialog({ onRoomCreated }: CreateRoomDialogProps) {
  const { user, token } = useAuth()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roomData, setRoomData] = useState({
    name: "",
    description: "",
    type: "GROUP" as "PRIVATE" | "GROUP" | "PUBLIC",
  })

  useEffect(() => {
    if (open && token) {
      loadUsers()
    }
  }, [open, token])

  const loadUsers = async () => {
    try {
      const usersList = await chatService.getUsers()
      setUsers(usersList)
    } catch (error) {
      console.error("Failed to load users", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }

  const handleCreateRoom = async () => {
    if (!roomData.name.trim() || selectedParticipants.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select participants",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const createRequest: CreateRoomRequest = {
        ...roomData,
        participants: selectedParticipants,
      }

      await chatService.createRoom(createRequest)
      
      toast({
        title: "Success",
        description: "Chat room created successfully",
      })
      
      setOpen(false)
      resetForm()
      onRoomCreated()
    } catch (error) {
      console.error("Failed to create room:", error)
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setRoomData({
      name: "",
      description: "",
      type: "GROUP",
    })
    setSelectedParticipants([])
    setSearchTerm("")
  }

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const removeParticipant = (userId: string) => {
    setSelectedParticipants(prev => prev.filter(id => id !== userId))
  }

  const filteredUsers = users.filter(
    user =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: "bg-red-100 text-red-700",
      SUPERVISEUR: "bg-blue-100 text-blue-700",
      AGENT: "bg-green-100 text-green-700",
    }
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  // Only show for admin users
  if (user?.role !== "ADMIN") {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create New Chat Room</DialogTitle>
          <DialogDescription>
            Create a new chat room and select participants. Only you can see this option as an admin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Room Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room Name *</Label>
              <Input
                id="room-name"
                value={roomData.name}
                onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter room name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-type">Room Type *</Label>
              <Select
                value={roomData.type}
                onValueChange={(value: "PRIVATE" | "GROUP" | "PUBLIC") =>
                  setRoomData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="GROUP">Group</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-description">Description</Label>
            <Textarea
              id="room-description"
              value={roomData.description}
              onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter room description"
              rows={3}
            />
          </div>

          {/* Participant Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Participants *</Label>
              <span className="text-sm text-gray-500">
                {selectedParticipants.length} selected
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Selected Participants */}
            {selectedParticipants.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Participants:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedParticipants.map(userId => {
                    const user = users.find(u => u.id === userId)
                    if (!user) return null
                    return (
                      <Badge key={userId} variant="secondary" className="gap-1">
                        {user.firstName} {user.lastName}
                        <button
                          onClick={() => removeParticipant(userId)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Users List */}
            <ScrollArea className="h-64 border rounded-md p-2">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md"
                  >
                    <Checkbox
                      id={user.id}
                      checked={selectedParticipants.includes(user.id)}
                      onCheckedChange={() => toggleParticipant(user.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={user.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {user.firstName} {user.lastName}
                        </Label>
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRoom}
            disabled={isLoading || !roomData.name.trim() || selectedParticipants.length === 0}
          >
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

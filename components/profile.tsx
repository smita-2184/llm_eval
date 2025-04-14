"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, BookOpen, GraduationCap, Calendar, Clock, UserCircle } from "lucide-react"
import { format } from "date-fns"

export function Profile() {
  const { userData } = useAuth()

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    )
  }

  // Format timestamps
  const lastLoginDate = userData.lastLogin ? format(userData.lastLogin.toDate(), "PPP p") : "Never"
  const createdAtDate = userData.createdAt ? format(userData.createdAt.toDate(), "PPP") : "Unknown"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Profile Information</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{userData.username}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{userData.role}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{userData.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-medium">{userData.course}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Major</p>
              <p className="font-medium">{userData.major}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Semester</p>
              <p className="font-medium">{userData.semester}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="font-medium">{lastLoginDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="font-medium">{createdAtDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useState } from "react"
import { Globe, LogOut, User, ChevronDown, Settings, BookOpen, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RatingGuideModal } from "@/components/rating-guide-modal"
import { ScaleValidation } from "@/components/scale-validation"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Profile } from "@/components/profile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function UserHeader() {
  // Add state for the Rating Guide modal
  const [ratingGuideOpen, setRatingGuideOpen] = useState(false)
  // Add state for the Scale Validation modal
  const [scaleValidationOpen, setScaleValidationOpen] = useState(false)
  // Add state for the Profile modal
  const [profileOpen, setProfileOpen] = useState(false)

  const { userData, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  // Use userData from auth context
  const name = userData?.username || "User"
  const program = userData?.course || ""
  const semester = userData?.semester ? `Semester ${userData.semester}` : ""
  const subject = userData?.major || ""

  return (
    <header className="bg-secondary/50 backdrop-blur-md border-b border-border/40 p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/50">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}`} alt={name} />
          <AvatarFallback className="bg-primary/20 text-primary-foreground">{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Studium</h1>
          <p className="text-sm text-muted-foreground">
            {program} • {semester} • {subject}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border/50 w-40">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Spanish</DropdownMenuItem>
            <DropdownMenuItem>French</DropdownMenuItem>
            <DropdownMenuItem>German</DropdownMenuItem>
            <DropdownMenuItem>Chinese</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Scale Validation Button */}
        <Button
          onClick={() => setScaleValidationOpen(true)}
          className="bg-purple-600/90 text-white hover:bg-purple-700 border-purple-500"
        >
          Scale Validation
        </Button>

        {/* Updated Rating Guide button with better visibility */}
        <Button
          onClick={() => setRatingGuideOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Rating Guide
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <User className="h-4 w-4" />
              <span>Account</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border/50 w-48">
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/test-history")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Test History</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Add the Rating Guide Modal */}
      <RatingGuideModal open={ratingGuideOpen} onOpenChange={setRatingGuideOpen} />

      {/* Add the Scale Validation Modal */}
      <ScaleValidation open={scaleValidationOpen} onOpenChange={setScaleValidationOpen} />

      {/* Add the Profile Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
          </DialogHeader>
          <Profile />
        </DialogContent>
      </Dialog>
    </header>
  )
}


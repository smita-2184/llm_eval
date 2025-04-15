"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Trophy, LogOut } from "lucide-react"

interface CompletionPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompletionPopup({ open, onOpenChange }: CompletionPopupProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-2xl">Congratulations! 🎉</DialogTitle>
          <DialogDescription className="text-center mt-2">
            You have successfully completed all tasks! Thank you for your participation in our evaluation platform.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLogout}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
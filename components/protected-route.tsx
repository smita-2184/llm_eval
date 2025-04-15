"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { ScaleValidation } from "@/components/scale-validation"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth()
  const router = useRouter()
  const [showScaleValidation, setShowScaleValidation] = useState(false)

  useEffect(() => {
    if (!loading && !userData) {
      router.push("/login")
    } else if (userData && !userData.hasCompletedScaleValidation) {
      setShowScaleValidation(true)
    }
  }, [userData, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <>
      {children}
      <ScaleValidation open={showScaleValidation} onOpenChange={setShowScaleValidation} />
    </>
  )
}


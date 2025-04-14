import { TestRatingsHistory } from "@/components/test-ratings-history"
import { ProtectedRoute } from "@/components/protected-route"

export default function TestHistoryPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <TestRatingsHistory />
      </div>
    </ProtectedRoute>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchEvaluations } from "@/lib/evaluation-service"
import { Loader2 } from "lucide-react"

export function EvaluationResults() {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvaluations() {
      try {
        const data = await fetchEvaluations()
        setEvaluations(data)
      } catch (error) {
        console.error("Error loading evaluations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvaluations()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
        <p>Loading evaluation results...</p>
      </div>
    )
  }

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">
            No evaluation results available yet. Complete some evaluations to see results here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Results</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Evaluation results would be displayed here */}
        <p>Results will be displayed here once implemented.</p>
      </CardContent>
    </Card>
  )
}


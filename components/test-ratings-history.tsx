"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface TestRating {
  id: string
  question: string
  answer: string
  scientificRating: number
  clarityRating: number
  helpfulnessRating: number
  wouldUseAgain: boolean
  modelId: string
  timestamp: any
  comments?: string
  score?: number

  // Additional fields
  strengths: string[]
  improvements: string[]
  annotatedAnswer: string
  detailedFeedback: string
  analysisScore: number
}

export function TestRatingsHistory() {
  const [ratings, setRatings] = useState<TestRating[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRating, setExpandedRating] = useState<string | null>(null)
  const { userData } = useAuth()

  useEffect(() => {
    async function fetchRatings() {
      if (!userData?.id) return

      setLoading(true)
      try {
        const ratingsRef = collection(db, "test_ratings")
        const q = query(ratingsRef, where("userId", "==", userData.id), orderBy("timestamp", "desc"))

        const querySnapshot = await getDocs(q)
        const ratingsData: TestRating[] = []

        querySnapshot.forEach((doc) => {
          ratingsData.push({
            id: doc.id,
            ...doc.data(),
          } as TestRating)
        })

        setRatings(ratingsData)
      } catch (error) {
        console.error("Error fetching test ratings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [userData?.id])

  const toggleExpand = (id: string) => {
    if (expandedRating === id) {
      setExpandedRating(null)
    } else {
      setExpandedRating(id)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <p>Loading your test ratings...</p>
      </div>
    )
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Test Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            You haven't submitted any test ratings yet. Complete some evaluations to see your history here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getModelColor = (modelId: string) => {
    switch (modelId) {
      case "gpt-4":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
      case "gpt-3.5":
        return "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
      case "gemini-pro":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
      case "llama":
        return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
      case "mixtral":
        return "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300"
      default:
        return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300"
    }
  }

  const getModelIcon = (modelId: string) => {
    switch (modelId) {
      case "gpt-4":
        return "🤖"
      case "gpt-3.5":
        return "🧠"
      case "gemini-pro":
        return "🌀"
      case "llama":
        return "🦙"
      case "mixtral":
        return "🔄"
      default:
        return "🤖"
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Test Ratings</h2>

      {ratings.map((rating) => (
        <Card key={rating.id} className="overflow-hidden">
          <CardHeader className="pb-3 bg-secondary/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge className={`px-2 py-1 ${getModelColor(rating.modelId)}`}>
                  <span className="mr-1">{getModelIcon(rating.modelId)}</span>
                  {rating.modelId}
                </Badge>
                <Badge variant="outline" className="bg-background/80">
                  Your Rating: {rating.score || 0}/100
                </Badge>
                {rating.analysisScore !== undefined && (
                  <Badge
                    variant="outline"
                    className="bg-background/80 border-amber-500/50 text-amber-600 dark:text-amber-400"
                  >
                    Analysis Score: {rating.analysisScore}/100
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {rating.timestamp?.toDate
                  ? formatDistanceToNow(rating.timestamp.toDate(), { addSuffix: true })
                  : "Recently"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Question:</h3>
                <p className="text-sm text-muted-foreground">{rating.question}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Your Answer:</h3>
                <p className="text-sm text-muted-foreground">{rating.answer}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col items-center p-2 bg-secondary/30 rounded-md">
                  <span className="text-sm text-muted-foreground mb-1">Scientific</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating.scientificRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center p-2 bg-secondary/30 rounded-md">
                  <span className="text-sm text-muted-foreground mb-1">Clarity</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating.clarityRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center p-2 bg-secondary/30 rounded-md">
                  <span className="text-sm text-muted-foreground mb-1">Helpfulness</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating.helpfulnessRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <span className="text-sm mr-2">Would use again:</span>
                {rating.wouldUseAgain ? (
                  <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>

              {rating.comments && (
                <div className="pt-2">
                  <h3 className="font-medium mb-1">Comments:</h3>
                  <p className="text-sm text-muted-foreground italic">{rating.comments}</p>
                </div>
              )}

              <Collapsible open={expandedRating === rating.id}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 flex items-center justify-center"
                    onClick={() => toggleExpand(rating.id)}
                  >
                    {expandedRating === rating.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Analysis Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Analysis Details
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  {/* Analysis Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <Card className="bg-green-50/5 border border-green-200/20 overflow-hidden">
                      <CardHeader className="bg-green-500/10 border-b border-green-200/20 py-2">
                        <CardTitle className="text-sm flex items-center text-green-700 dark:text-green-300">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        {rating.strengths && rating.strengths.length > 0 ? (
                          <ul className="space-y-2 text-sm">
                            {rating.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No strengths identified.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Areas for Improvement */}
                    <Card className="bg-red-50/5 border border-red-200/20 overflow-hidden">
                      <CardHeader className="bg-red-500/10 border-b border-red-200/20 py-2">
                        <CardTitle className="text-sm flex items-center text-red-700 dark:text-red-300">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        {rating.improvements && rating.improvements.length > 0 ? (
                          <ul className="space-y-2 text-sm">
                            {rating.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No improvements suggested.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Annotated Answer */}
                  {rating.annotatedAnswer && (
                    <Card className="border border-border/60 overflow-hidden">
                      <CardHeader className="py-2 border-b border-border/60">
                        <CardTitle className="text-sm">Annotated Answer</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="border-l-4 border-red-500 pl-3 py-2 bg-red-50/10 rounded-r-md">
                          <p className="text-sm font-medium">{rating.answer}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 italic">{rating.annotatedAnswer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detailed Feedback */}
                  {rating.detailedFeedback && (
                    <Card className="border border-border/60 overflow-hidden">
                      <CardHeader className="py-2 border-b border-border/60">
                        <CardTitle className="text-sm flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                          Detailed Feedback
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-line">{rating.detailedFeedback}</p>
                      </CardContent>
                    </Card>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, ChevronRight, Award, BarChart2, Brain, Loader2, TestTube, PenTool } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useAuth } from "@/contexts/auth-context"
import {
  subscribeToUserActivities,
  fetchUserActivities,
  type UserActivity,
  llmModels,
} from "@/lib/user-activity-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { CompletionPopup } from "@/components/completion-popup"

export function ProgressSidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "scale-validation",
    "llm-evaluation",
    "take-test",
    "quiz-creation",
  ])
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const { userData } = useAuth()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    async function initializeUserActivity() {
      if (!userData?.id) return

      setLoading(true)
      try {
        // First, fetch initial data
        const initialActivity = await fetchUserActivities(userData.id)
        setUserActivity(initialActivity)
        setLoading(false)

        // Then set up real-time listener
        unsubscribe = subscribeToUserActivities(
          userData.id,
          (updatedActivity) => {
            setUserActivity(updatedActivity)
            // Show completion popup when progress reaches 100%
            if (updatedActivity.completionPercentage === 100) {
              setShowCompletionPopup(true)
            }
          },
          (error) => {
            console.error("Error in activity subscription:", error)
          },
        )
      } catch (error) {
        console.error("Error loading user activity:", error)
        setLoading(false)
      }
    }

    initializeUserActivity()

    // Clean up subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userData?.id])

  // Calculate user level based on completion percentage
  const getUserLevel = (percentage: number) => {
    if (percentage >= 80) return "Expert Evaluator"
    if (percentage >= 50) return "Advanced Evaluator"
    if (percentage >= 20) return "Intermediate Evaluator"
    return "Novice Evaluator"
  }

  // Get level number based on completion percentage
  const getLevelNumber = (percentage: number) => {
    if (percentage >= 80) return 4
    if (percentage >= 50) return 3
    if (percentage >= 20) return 2
    return 1
  }

  return (
    <>
      <div className="w-64 bg-secondary/30 border-r border-border/40 overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-border/40">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Studium</h1>
          </div>

          <h2 className="font-medium mb-2 text-muted-foreground text-sm">Your Progress</h2>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <Progress
                value={userActivity?.completionPercentage || 0}
                className="h-2 mb-2 bg-secondary"
                indicatorClassName="bg-primary"
              />
              <div className="flex justify-between text-sm">
                <div className="text-primary">{userActivity?.completionPercentage || 0}% Complete</div>
                <div className="text-muted-foreground">{getUserLevel(userActivity?.completionPercentage || 0)}</div>
              </div>

              <div className="flex items-center mt-4 mb-2 bg-secondary/80 p-2 rounded-lg">
                <Award className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-sm font-medium">
                  Level {getLevelNumber(userActivity?.completionPercentage || 0)}
                </span>
                <Badge className="ml-auto bg-primary/20 text-primary text-xs">
                  {userActivity?.completedActivities || 0}/{userActivity?.totalActivities || 0} Tasks
                </Badge>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              <h2 className="font-medium text-sm">Progress Tracker</h2>
            </div>
          </div>

          <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="px-2">
            <AccordionItem value="scale-validation" className="border-border/40">
              <AccordionTrigger className="py-2 text-primary hover:no-underline">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-200" />
                  <span>Scale Validation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center">
                          {userActivity?.completedScaleValidation ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground mr-2" />
                          )}
                          <span
                            className={`text-sm ${userActivity?.completedScaleValidation ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            Complete Scale Validation
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{userActivity?.completedScaleValidation ? "Completed" : "Not yet completed"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="llm-evaluation" className="border-border/40">
              <AccordionTrigger className="py-2 hover:no-underline text-primary">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-200" />
                  <span>LLM Comparison</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {llmModels.map((model) => (
                    <TooltipProvider key={`eval-${model.id}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {userActivity?.completedModels.includes(model.id) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground mr-2" />
                            )}
                            <span
                              className={`text-sm ${userActivity?.completedModels.includes(model.id) ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              Rate {model.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{userActivity?.completedModels.includes(model.id) ? "Completed" : "Not yet completed"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="take-test" className="border-border/40">
              <AccordionTrigger className="py-2 hover:no-underline text-primary">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-200" />
                  <TestTube className="h-4 w-4 mr-2" />
                  <span>Take Test</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {llmModels.map((model) => (
                    <TooltipProvider key={`test-${model.id}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {userActivity?.completedTestModels.includes(model.id) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground mr-2" />
                            )}
                            <span
                              className={`text-sm ${userActivity?.completedTestModels.includes(model.id) ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              Test {model.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {userActivity?.completedTestModels.includes(model.id) ? "Completed" : "Not yet completed"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="quiz-creation" className="border-border/40">
              <AccordionTrigger className="py-2 hover:no-underline text-primary">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 transition-transform duration-200" />
                  <PenTool className="h-4 w-4 mr-2" />
                  <span>Quiz Creation</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {llmModels.map((model) => (
                    <TooltipProvider key={`quiz-${model.id}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            {userActivity?.completedQuizModels.includes(model.id) ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground mr-2" />
                            )}
                            <span
                              className={`text-sm ${userActivity?.completedQuizModels.includes(model.id) ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              Create with {model.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {userActivity?.completedQuizModels.includes(model.id) ? "Completed" : "Not yet completed"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <CompletionPopup open={showCompletionPopup} onOpenChange={setShowCompletionPopup} />
    </>
  )
}


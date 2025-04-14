"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  Star,
  Loader2,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  KeyRound,
  Settings,
  Sparkles,
  MessageSquare,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateResponses, type LlmResponses } from "@/app/actions/generate-responses"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { saveEvaluation } from "@/lib/evaluation-service"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const llmModels = [
  {
    id: "gpt-4",
    name: "OpenAI GPT-4",
    color: "bg-emerald-500",
    icon: "🤖",
    keyType: "openai-key",
    description: "Advanced reasoning and instruction following capabilities",
  },
  {
    id: "gemini-pro",
    name: "Google Gemini Pro",
    color: "bg-blue-500",
    icon: "🌀",
    keyType: "google-key",
    description: "Multimodal understanding with strong scientific knowledge",
  },
  {
    id: "llama",
    name: "Meta LLaMA",
    color: "bg-purple-500",
    icon: "🦙",
    keyType: "groq-llama-key",
    description: "Open-source model with strong reasoning capabilities",
  },
  {
    id: "mixtral",
    name: "Mixtral",
    color: "bg-amber-500",
    icon: "🔄",
    keyType: "mixtral-key",
    description: "Mixture-of-experts architecture with specialized knowledge",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    color: "bg-indigo-500",
    icon: "🔍",
    keyType: "openai-key", // Uses OpenAI key
    description: "Specialized in deep technical and scientific content",
  },
]

export function LlmComparison() {
  const [question, setQuestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [responses, setResponses] = useState<LlmResponses>({})
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({})
  const [activeTab, setActiveTab] = useState("input")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  const [apiKeyWarning, setApiKeyWarning] = useState<boolean>(false)
  const [wouldUseAgain, setWouldUseAgain] = useState<Record<string, boolean>>({})

  const { userData } = useAuth()
  const router = useRouter()

  const handleGenerateResponses = async () => {
    if (!question.trim()) return

    setIsGenerating(true)
    setActiveTab("responses")
    setError(null)
    setApiKeyWarning(false)

    try {
      // Initialize empty responses for all models to show loading state
      const initialResponses: LlmResponses = {}
      llmModels.forEach((model) => {
        initialResponses[model.id] = {
          text: "",
          timestamp: new Date().toISOString(),
          loading: true,
        }
      })
      setResponses(initialResponses)

      // Call the server action to generate responses
      let generatedResponses: LlmResponses = {}

      try {
        generatedResponses = await generateResponses(question)
      } catch (err: any) {
        console.error("Error in generateResponses:", err)
        // Don't rethrow - we'll handle partial failures
      }

      // Merge with initial responses to ensure we have entries for all models
      const mergedResponses: LlmResponses = { ...initialResponses }

      // Update with any successful responses
      Object.entries(generatedResponses).forEach(([modelId, response]) => {
        mergedResponses[modelId] = response
      })

      // Clear loading state for any models that didn't get a response
      Object.keys(mergedResponses).forEach((modelId) => {
        if (mergedResponses[modelId].loading) {
          mergedResponses[modelId] = {
            text: "",
            timestamp: new Date().toISOString(),
            error: "Failed to get response from this model",
          }
        }
      })

      setResponses(mergedResponses)

      // Check if any responses have API key errors
      const hasApiKeyErrors = Object.values(mergedResponses).some(
        (response) => response.error && response.error.includes("API key"),
      )

      if (hasApiKeyErrors) {
        setApiKeyWarning(true)
      }
    } catch (err: any) {
      console.error("Unexpected error in handleGenerateResponses:", err)

      // Don't clear responses - keep any that might have succeeded
      if (Object.keys(responses).length === 0) {
        // Only set error if we have no responses at all
        setError("Failed to generate responses. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRating = (modelId: string, category: string, rating: number) => {
    setRatings({
      ...ratings,
      [modelId]: {
        ...(ratings[modelId] || {}),
        [category]: rating,
      },
    })
  }

  const handleWouldUseAgain = (modelId: string, value: boolean) => {
    setWouldUseAgain({
      ...wouldUseAgain,
      [modelId]: value,
    })
  }

  const getAverageRating = (modelId: string) => {
    if (!ratings[modelId]) return 0

    const modelRatings = ratings[modelId]
    const sum = Object.values(modelRatings).reduce((acc, val) => acc + val, 0)
    return sum / Object.values(modelRatings).length
  }

  const handleSubmitEvaluations = async () => {
    if (!userData) {
      setError("You must be logged in to submit evaluations")
      return
    }

    setIsSubmitting(true)
    setSubmissionSuccess(false)

    try {
      // Create an array of promises for each model's evaluation
      const savePromises = Object.entries(ratings).map(async ([modelId, modelRatings]) => {
        // Skip if we don't have all required ratings or the response
        if (
          !modelRatings.scientific ||
          !modelRatings.clarity ||
          !modelRatings.helpfulness ||
          !responses[modelId] ||
          !responses[modelId].text
        ) {
          return null
        }

        // Determine willingness based on wouldUseAgain
        const willingness =
          wouldUseAgain[modelId] === true ? "positive" : wouldUseAgain[modelId] === false ? "negative" : "neutral"

        // Format the evaluation data according to the required structure
        const evaluationData = {
          metrics: {
            clarity: modelRatings.clarity,
            helpfulness: modelRatings.helpfulness,
            scientific: modelRatings.scientific,
          },
          modelId: modelId,
          question: question,
          raterType: "user",
          response: responses[modelId].text,
          userId: userData.id,
          username: userData.username,
          willingness: willingness,
        }

        // Save the evaluation to Firebase
        return saveEvaluation(evaluationData)
      })

      // Wait for all save operations to complete
      const results = await Promise.all(savePromises)

      // Filter out null results (skipped models)
      const successfulSaves = results.filter((result) => result !== null)

      if (successfulSaves.length > 0) {
        setSubmissionSuccess(true)
        // Reset ratings after successful submission
        setRatings({})
        setWouldUseAgain({})

        // No need to refresh the page since we're using real-time updates now
      } else {
        setError("No evaluations were submitted. Please rate at least one model.")
      }
    } catch (err) {
      console.error("Error submitting evaluations:", err)
      setError("Failed to submit evaluations. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="bg-primary/20 p-2 rounded-lg mr-3">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">LLM Comparison</h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {apiKeyWarning && (
        <Alert className="mb-6 bg-amber-950/30 border-amber-500/30">
          <KeyRound className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">API Key Warning</AlertTitle>
          <AlertDescription className="text-amber-400/80">
            Some API keys are missing or invalid. Some models may not generate responses.
            <div className="mt-2 flex">
              <Button
                variant="outline"
                size="sm"
                className="text-amber-500 border-amber-500/50 bg-amber-950/50 hover:bg-amber-950/80"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure API Keys
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {submissionSuccess && (
        <Alert className="mb-6 bg-green-950/30 border-green-500/30">
          <Sparkles className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Success</AlertTitle>
          <AlertDescription className="text-green-400/80">
            Your evaluations have been submitted successfully. Thank you for your feedback!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-secondary p-1 rounded-xl">
          <TabsTrigger
            value="input"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Research Question
          </TabsTrigger>
          <TabsTrigger
            value="responses"
            disabled={Object.keys(responses).length === 0 && !isGenerating}
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            LLM Responses{" "}
            {Object.keys(responses).length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary-foreground">
                {Object.keys(responses).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card className="bg-card border-border/40 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Enter Your Research Question
              </CardTitle>
              <CardDescription>Ask a question to compare responses from different LLMs</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <Textarea
                placeholder="Type your research question here... (e.g., 'Explain the concept of quantum entanglement')"
                className="min-h-[150px] mb-4 text-base bg-secondary/50 border-border/40 focus:border-primary/50 focus:ring-primary/20"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleGenerateResponses}
                disabled={isGenerating || !question.trim()}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate LLM Responses
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            {llmModels.map((model) => (
              <Card
                key={model.id}
                className="bg-card border-border/40 overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
              >
                <CardHeader className={`${model.color} bg-opacity-20 py-3 border-b border-border/40`}>
                  <CardTitle className="text-center text-lg flex items-center justify-center">
                    <span className="mr-2 text-xl">{model.icon}</span>
                    {model.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                  <div className="flex items-center justify-center">
                    {responses[model.id]?.loading ? (
                      <Badge variant="outline" className="bg-secondary text-primary animate-pulse">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </Badge>
                    ) : responses[model.id]?.text ? (
                      <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                        Response ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-secondary/50 text-muted-foreground">
                        Waiting for question
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses">
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border/40 p-6 rounded-xl shadow-lg mb-6 text-center"
              >
                <div className="bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <p className="text-lg font-medium">Generating responses from LLMs...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            {Object.entries(responses).map(([modelId, response]) => {
              const model = llmModels.find((m) => m.id === modelId)!

              // Skip if model not found
              if (!model) return null

              // Show loading state
              if (response.loading) {
                return (
                  <Card key={modelId} className="bg-card border-border/40 shadow-lg overflow-hidden">
                    <div className={`h-1 ${model.color} bg-opacity-70`} />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center">
                        <span className="mr-2 text-2xl">{model.icon}</span>
                        {model.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                      <p>Generating response...</p>
                    </CardContent>
                  </Card>
                )
              }

              // Show error state
              if (response.error) {
                const isApiKeyError = response.error.includes("API key")

                return (
                  <Card key={modelId} className="bg-card border-border/40 shadow-lg overflow-hidden">
                    <div className="h-1 bg-red-500" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl flex items-center">
                        <span className="mr-2 text-2xl">{model.icon}</span>
                        {model.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert
                        variant={isApiKeyError ? "default" : "destructive"}
                        className={
                          isApiKeyError
                            ? "bg-amber-950/30 border-amber-500/30"
                            : "bg-destructive/10 border-destructive/20"
                        }
                      >
                        <KeyRound className={`h-4 w-4 ${isApiKeyError ? "text-amber-500" : "text-destructive"}`} />
                        <AlertTitle className={isApiKeyError ? "text-amber-500" : "text-destructive"}>
                          {isApiKeyError ? "API Key Required" : "Error"}
                        </AlertTitle>
                        <AlertDescription className={isApiKeyError ? "text-amber-400/80" : "text-destructive/80"}>
                          {isApiKeyError
                            ? `This model requires a valid API key. Please configure the ${model.keyType} in your Firebase database.`
                            : response.error}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <motion.div
                  key={modelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card border-border/40 shadow-lg overflow-hidden">
                    <div className={`h-1 ${model.color} bg-opacity-70`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center">
                          <span className="mr-2 text-2xl">{model.icon}</span>
                          {model.name}
                        </CardTitle>
                        {getAverageRating(modelId) > 0 && (
                          <div className="flex items-center bg-secondary/80 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                            <span className="text-sm font-medium">{getAverageRating(modelId).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="bg-secondary/30 p-4 rounded-lg mb-4 whitespace-pre-line border border-border/40">
                        {response.text}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Scientific Accuracy</h4>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <TooltipProvider key={rating}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-9 w-9 ${
                                        ratings[modelId]?.scientific === rating
                                          ? "bg-primary/20 border-primary/50 text-primary"
                                          : "bg-secondary/50 border-border/40"
                                      }`}
                                      onClick={() => handleRating(modelId, "scientific", rating)}
                                    >
                                      {rating}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {rating === 1
                                        ? "Poor"
                                        : rating === 2
                                          ? "Fair"
                                          : rating === 3
                                            ? "Good"
                                            : rating === 4
                                              ? "Very Good"
                                              : "Excellent"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Clarity</h4>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <TooltipProvider key={rating}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-9 w-9 ${
                                        ratings[modelId]?.clarity === rating
                                          ? "bg-primary/20 border-primary/50 text-primary"
                                          : "bg-secondary/50 border-border/40"
                                      }`}
                                      onClick={() => handleRating(modelId, "clarity", rating)}
                                    >
                                      {rating}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {rating === 1
                                        ? "Poor"
                                        : rating === 2
                                          ? "Fair"
                                          : rating === 3
                                            ? "Good"
                                            : rating === 4
                                              ? "Very Good"
                                              : "Excellent"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Helpfulness</h4>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <TooltipProvider key={rating}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-9 w-9 ${
                                        ratings[modelId]?.helpfulness === rating
                                          ? "bg-primary/20 border-primary/50 text-primary"
                                          : "bg-secondary/50 border-border/40"
                                      }`}
                                      onClick={() => handleRating(modelId, "helpfulness", rating)}
                                    >
                                      {rating}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {rating === 1
                                        ? "Poor"
                                        : rating === 2
                                          ? "Fair"
                                          : rating === 3
                                            ? "Good"
                                            : rating === 4
                                              ? "Very Good"
                                              : "Excellent"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                            Would you use this model again?
                          </h4>
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center ${
                                wouldUseAgain[modelId] === true
                                  ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                  : "bg-secondary/50 border-border/40"
                              }`}
                              onClick={() => handleWouldUseAgain(modelId, true)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Yes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex items-center ${
                                wouldUseAgain[modelId] === false
                                  ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                                  : "bg-secondary/50 border-border/40"
                              }`}
                              onClick={() => handleWouldUseAgain(modelId, false)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              No
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-border/40 pt-4 flex justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center bg-secondary/50 border-border/40 hover:bg-secondary"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center bg-secondary/50 border-border/40 hover:bg-secondary"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Not Helpful
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-secondary/50 border-border/40 hover:bg-secondary"
                      >
                        Add Comment
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {Object.keys(responses).length > 0 && !isGenerating && (
            <div className="mt-8 flex justify-end">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                onClick={handleSubmitEvaluations}
                disabled={isSubmitting || Object.keys(ratings).length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Evaluations"
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to get the color from the Tailwind class
function getModelColor(colorClass: string): string {
  return colorClass.replace("bg-", "").includes("green")
    ? "#22c55e"
    : colorClass.replace("bg-", "").includes("blue")
      ? "#3b82f6"
      : colorClass.replace("bg-", "").includes("purple")
        ? "#a855f7"
        : colorClass.replace("bg-", "").includes("amber")
          ? "#f59e0b"
          : "#6366f1"
}


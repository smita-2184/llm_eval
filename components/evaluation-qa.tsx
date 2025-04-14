"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Info, Loader2, Star, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { saveTestRating } from "@/lib/test-rating-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const models = [
  {
    id: "gpt-4",
    name: "GPT-4",
    icon: "🤖",
    color: "border-blue-500 bg-blue-50/10 hover:bg-blue-100/20",
    activeColor: "border-blue-500 bg-blue-100/30 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    id: "gpt-3.5",
    name: "GPT-3.5",
    icon: "🧠",
    color: "border-teal-500 bg-teal-50/10 hover:bg-teal-100/20",
    activeColor: "border-teal-500 bg-teal-100/30 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    icon: "🌀",
    color: "border-purple-500 bg-purple-50/10 hover:bg-purple-100/20",
    activeColor: "border-purple-500 bg-purple-100/30 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  {
    id: "llama",
    name: "LLaMA 70B",
    icon: "🦙",
    color: "border-amber-500 bg-amber-50/10 hover:bg-amber-100/20",
    activeColor: "border-amber-500 bg-amber-100/30 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    id: "mixtral",
    name: "Mixtral 8x7B",
    icon: "🔄",
    color: "border-pink-500 bg-pink-50/10 hover:bg-pink-100/20",
    activeColor: "border-pink-500 bg-pink-100/30 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🔍",
    color: "border-indigo-500 bg-indigo-50/10 hover:bg-indigo-100/20",
    activeColor: "border-indigo-500 bg-indigo-100/30 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
]

// Sample data for the analysis
const sampleAnalysis = {
  strengths: [] as string[],
  improvements: [
    "Provide a complete definition of energy.",
    "Include examples of different forms of energy.",
    "Discuss the importance of energy in various contexts (e.g., physical, biological, technological).",
    "Cite sources or references for the provided information.",
  ],
  annotatedAnswer: "The answer is incomplete and does not provide information about the concept of energy.",
  detailedFeedback:
    "The provided answer is insufficient for a comprehensive understanding of the concept of energy. It is essential to offer a complete definition that includes both the scientific understanding (the capacity to do work) and the various forms it can take (e.g., kinetic, potential, thermal, electrical, chemical, nuclear, and mass energy).\n\nAdditionally, explaining the role of energy in different systems, such as ecosystems, human-made machines, and the universe, can provide a more rounded understanding, including examples and applications of each form of energy would also enrich the answer. Lastly, citing reliable sources would enhance the credibility of the information provided.",
}

export function EvaluationQA() {
  const [question, setQuestion] = useState("what is energy")
  const [answer, setAnswer] = useState("energy is...")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [scientificRating, setScientificRating] = useState<number | null>(null)
  const [clarityRating, setClarityRating] = useState<number | null>(null)
  const [helpfulnessRating, setHelpfulnessRating] = useState<number | null>(null)
  const [wouldUseAgain, setWouldUseAgain] = useState<boolean | null>(null)
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  // Analysis state
  const [strengths, setStrengths] = useState<string[]>([])
  const [improvements, setImprovements] = useState<string[]>([])
  const [annotatedAnswer, setAnnotatedAnswer] = useState("")
  const [detailedFeedback, setDetailedFeedback] = useState("")
  const [analysisScore, setAnalysisScore] = useState(0)

  const { userData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleAnalyzeAnswer = async () => {
    if (!question.trim() || !answer.trim()) return

    setIsAnalyzing(true)
    setShowResults(false)

    // Simulate API call for analysis
    setTimeout(() => {
      // Set the analysis data
      setStrengths(sampleAnalysis.strengths)
      setImprovements(sampleAnalysis.improvements)
      setAnnotatedAnswer(sampleAnalysis.annotatedAnswer)
      setDetailedFeedback(sampleAnalysis.detailedFeedback)

      // Calculate a sample score (0-100)
      // In a real implementation, this would come from the analysis
      setAnalysisScore(Math.floor(Math.random() * 30)) // Low score for the sample answer

      setIsAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  const handleSubmitRating = async () => {
    if (!userData) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit ratings",
        variant: "destructive",
      })
      return
    }

    if (!scientificRating || !clarityRating || !helpfulnessRating || wouldUseAgain === null) {
      toast({
        title: "Missing ratings",
        description: "Please complete all rating fields before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate a simple score based on ratings (0-100)
      const score = Math.round(((scientificRating + clarityRating + helpfulnessRating) / 15) * 100)

      // Prepare the rating data
      const ratingData = {
        userId: userData.id,
        username: userData.username,
        question,
        answer,
        scientificRating,
        clarityRating,
        helpfulnessRating,
        wouldUseAgain,
        modelId: selectedModel,
        comments,
        score,

        // Include the analysis data
        strengths: strengths,
        improvements: improvements,
        annotatedAnswer: annotatedAnswer,
        detailedFeedback: detailedFeedback,
        analysisScore: analysisScore,
      }

      // Save the rating to Firebase
      const result = await saveTestRating(ratingData)

      if (result.success) {
        setSubmissionSuccess(true)
        toast({
          title: "Rating submitted",
          description: "Your evaluation has been saved successfully",
          variant: "default",
        })

        // Reset form after successful submission
        setTimeout(() => {
          setScientificRating(null)
          setClarityRating(null)
          setHelpfulnessRating(null)
          setWouldUseAgain(null)
          setComments("")
          setShowResults(false)
          setSubmissionSuccess(false)

          // No need to refresh the page since we're using real-time updates now
        }, 3000)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast({
        title: "Submission failed",
        description: "There was an error saving your rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center mb-6">
        <div className="bg-primary/20 p-2 rounded-lg mr-3">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Take a Test</h2>
      </div>

      <Card className="bg-blue-50/5 border border-blue-200/20 shadow-md overflow-hidden">
        <CardHeader className="bg-blue-500/10 border-b border-blue-200/20 pb-4">
          <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
            <Info className="h-5 w-5 mr-2" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Follow these steps to get your answer analyzed:</p>
            <ol className="text-sm space-y-2 ml-5 list-decimal">
              <li className="text-foreground">Enter your question</li>
              <li className="text-foreground">Provide your answer</li>
              <li className="text-foreground">Select an LLM model to analyze your response</li>
              <li className="text-foreground">Click "Analyze Answer" to get detailed feedback</li>
              <li className="text-foreground">Rate the LLM's analysis performance</li>
              <li className="text-foreground">Try different LLMs to compare their analysis capabilities</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <span className="bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center mr-2">
            1
          </span>
          Model Selection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {models.map((model) => (
            <button
              key={model.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedModel === model.id ? model.activeColor : `${model.color} hover:scale-105`
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">{model.icon}</span>
                <span className="font-medium">{model.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <span className="bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center mr-2">
            2
          </span>
          Question:
        </h3>
        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <Textarea
              placeholder="Enter your research question here..."
              className="min-h-[100px] bg-background/50 border-input focus:border-primary/50 text-base"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center">
          <span className="bg-primary/10 text-primary w-7 h-7 rounded-full flex items-center justify-center mr-2">
            3
          </span>
          Your Answer:
        </h3>
        <Card className="border border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <Textarea
              placeholder="Enter your detailed answer here..."
              className="min-h-[150px] bg-background/50 border-input focus:border-primary/50 text-base"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
        onClick={handleAnalyzeAnswer}
        disabled={isAnalyzing || !question.trim() || !answer.trim()}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Answer"
        )}
      </Button>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 pt-4"
          >
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-foreground">Analysis Results</h3>
              <Badge
                variant="outline"
                className="text-xl font-bold px-4 py-2 bg-background/80 border-2 border-red-500/50"
              >
                {analysisScore}/100
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="bg-green-50/5 border-2 border-green-200/20 shadow-md overflow-hidden">
                <CardHeader className="bg-green-500/10 border-b border-green-200/20 pb-3">
                  <CardTitle className="flex items-center text-green-700 dark:text-green-300 text-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {strengths && strengths.length > 0 ? (
                    <ul className="space-y-3 text-foreground">
                      {strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No strengths identified in the current answer.</p>
                  )}
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="bg-red-50/5 border-2 border-red-200/20 shadow-md overflow-hidden">
                <CardHeader className="bg-red-500/10 border-b border-red-200/20 pb-3">
                  <CardTitle className="flex items-center text-red-700 dark:text-red-300 text-lg">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <ul className="space-y-3 text-foreground">
                    {improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Annotated Answer */}
            <Card className="border-2 border-border/60 shadow-md overflow-hidden">
              <CardHeader className="bg-background/80 border-b border-border/60 pb-3">
                <CardTitle className="text-lg">Annotated Answer</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="border-l-4 border-red-500 pl-4 py-3 bg-red-50/10 rounded-r-md">
                  <p className="font-medium text-foreground">{answer}</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 italic">{annotatedAnswer}</p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card className="border-2 border-border/60 shadow-md overflow-hidden">
              <CardHeader className="bg-background/80 border-b border-border/60 pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                  Detailed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-foreground leading-relaxed whitespace-pre-line">{detailedFeedback}</p>
              </CardContent>
            </Card>

            {/* Rating Section */}
            <Card className="border-2 border-border/60 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-border/60 pb-3">
                <CardTitle className="text-lg">Rate this Analysis</CardTitle>
                <CardDescription>Please rate the quality of the analysis provided by the AI</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-8">
                {/* Scientific Rating */}
                <div>
                  <h5 className="font-medium mb-3 text-foreground">Scientific Rating</h5>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          scientificRating === rating
                            ? "bg-primary text-primary-foreground border-primary scale-110"
                            : "bg-secondary border-border hover:bg-secondary/80 hover:scale-105"
                        }`}
                        onClick={() => setScientificRating(rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clarity Rating */}
                <div>
                  <h5 className="font-medium mb-3 text-foreground">Clarity Rating</h5>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          clarityRating === rating
                            ? "bg-primary text-primary-foreground border-primary scale-110"
                            : "bg-secondary border-border hover:bg-secondary/80 hover:scale-105"
                        }`}
                        onClick={() => setClarityRating(rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Helpfulness Rating */}
                <div>
                  <h5 className="font-medium mb-3 text-foreground">Helpfulness Rating</h5>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                          helpfulnessRating === rating
                            ? "bg-primary text-primary-foreground border-primary scale-110"
                            : "bg-secondary border-border hover:bg-secondary/80 hover:scale-105"
                        }`}
                        onClick={() => setHelpfulnessRating(rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Would Use Again */}
                <div>
                  <h5 className="font-medium mb-3 text-foreground">Would you use this analysis approach again?</h5>
                  <div className="flex space-x-4">
                    <button
                      className={`px-5 py-2.5 rounded-md border-2 flex items-center transition-all duration-200 ${
                        wouldUseAgain === true
                          ? "bg-green-500 text-white border-green-600 scale-105"
                          : "bg-secondary border-border hover:bg-secondary/80 hover:scale-105"
                      }`}
                      onClick={() => setWouldUseAgain(true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Yes
                    </button>
                    <button
                      className={`px-5 py-2.5 rounded-md border-2 flex items-center transition-all duration-200 ${
                        wouldUseAgain === false
                          ? "bg-red-500 text-white border-red-600 scale-105"
                          : "bg-secondary border-border hover:bg-secondary/80 hover:scale-105"
                      }`}
                      onClick={() => setWouldUseAgain(false)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      No
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h5 className="font-medium mb-3 text-foreground">Additional Comments (Optional)</h5>
                  <Textarea
                    placeholder="Share any additional thoughts about the analysis..."
                    className="min-h-[100px] bg-background/50 border-input focus:border-primary/50"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-background/80 border-t border-border/60 p-4">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                  onClick={handleSubmitRating}
                  disabled={
                    isSubmitting ||
                    !scientificRating ||
                    !clarityRating ||
                    !helpfulnessRating ||
                    wouldUseAgain === null ||
                    submissionSuccess
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : submissionSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Submitted Successfully
                    </>
                  ) : (
                    "Submit Rating"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


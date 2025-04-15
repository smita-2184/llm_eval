"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Trash2,
  Plus,
  Save,
  Info,
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  CheckCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { saveQuizQuestion } from "@/lib/quiz-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type QuizQuestion = {
  id: string
  question: string
  correctAnswer: string
  incorrectOptions: string[]
  explanation: string
  type: QuestionType
  difficulty: Difficulty
  category: Category
  model: Model
  ratings?: {
    scientific?: number
    clarity?: number
    helpfulness?: number
    wouldUse?: boolean
  }
}

type QuestionType = "Multiple Choice" | "True/False" | "Open Ended" | "Short Answer" | "Numerical"
type Difficulty = "Easy" | "Medium" | "Hard"
type Category = "Conceptual" | "Application" | "Context"
type Model = "GPT-4" | "Gemini Pro" | "LLaMA 70B" | "Mixtral 8x7B" | "DeepSeek"

// Model color mapping with improved contrast
const modelColors = {
  "GPT-4": {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-300",
    icon: "🤖",
  },
  "Gemini Pro": {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-700 dark:text-purple-300",
    icon: "🌀",
  },
  "LLaMA 70B": {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-300",
    icon: "🦙",
  },
  "Mixtral 8x7B": {
    bg: "bg-pink-100 dark:bg-pink-900/40",
    border: "border-pink-300 dark:border-pink-700",
    text: "text-pink-700 dark:text-pink-300",
    icon: "🔄",
  },
  "DeepSeek": {
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
    border: "border-indigo-300 dark:border-indigo-700",
    text: "text-indigo-700 dark:text-indigo-300",
    icon: "🔍",
  },
}

// Difficulty color mapping with improved contrast
const difficultyColors = {
  Easy: {
    bg: "bg-green-100 dark:bg-green-900/40",
    border: "border-green-300 dark:border-green-700",
    text: "text-green-700 dark:text-green-300",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  Medium: {
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    border: "border-yellow-300 dark:border-yellow-700",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  Hard: {
    bg: "bg-red-100 dark:bg-red-900/40",
    border: "border-red-300 dark:border-red-700",
    text: "text-red-700 dark:text-red-300",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
}

export function QuizCreation() {
  const [quizTitle, setQuizTitle] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [topic, setTopic] = useState("")
  const [selectedModel, setSelectedModel] = useState<Model>("GPT-4")
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("Medium")
  const [selectedType, setSelectedType] = useState<QuestionType>("Multiple Choice")
  const [selectedCategory, setSelectedCategory] = useState<Category>("Conceptual")
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [submissionSuccess, setSubmissionSuccess] = useState<Record<string, boolean>>({})

  const { userData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleGenerateQuestion = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing topic",
        description: "Please enter a topic to generate questions",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate API call to generate question
    setTimeout(() => {
      // Create a question based on the selected type
      let questionText = ""
      let correctAnswer = ""
      let incorrectOptions: string[] = []

      switch (selectedType) {
        case "Multiple Choice":
          questionText = `What is the primary characteristic of ${topic}?`
          correctAnswer = `The main defining feature of ${topic}`
          incorrectOptions = [
            `An unrelated characteristic`,
            `A secondary feature`,
            `A common misconception`,
          ]
          break
        case "True/False":
          questionText = `True or False: ${topic.charAt(0).toUpperCase() + topic.slice(1)} can be described as...`
          correctAnswer = "True"
          incorrectOptions = ["False"]
          break
        case "Open Ended":
          questionText = `Explain the importance of ${topic} and its applications.`
          correctAnswer = `${topic.charAt(0).toUpperCase() + topic.slice(1)} is important because...`
          incorrectOptions = [] // No incorrect options for open-ended questions
          break
        case "Short Answer":
          questionText = `Define ${topic} and provide one example of its use.`
          correctAnswer = `${topic.charAt(0).toUpperCase() + topic.slice(1)} is defined as...`
          incorrectOptions = [
            `An incorrect definition`,
            `A misleading example`,
          ]
          break
        case "Numerical":
          questionText = `Calculate the value related to ${topic} given the following parameters...`
          correctAnswer = "The calculated value"
          incorrectOptions = ["An incorrect calculation", "A different value"]
          break
        default:
          questionText = `What is ${topic}?`
          correctAnswer = `${topic.charAt(0).toUpperCase() + topic.slice(1)} is...`
          incorrectOptions = [
            `An incorrect definition`,
            `A misleading description`,
          ]
      }

      const newQuestion: QuizQuestion = {
        id: Date.now().toString(),
        question: questionText,
        correctAnswer: correctAnswer,
        incorrectOptions: incorrectOptions,
        explanation: `${topic.charAt(0).toUpperCase() + topic.slice(1)} is a topic that can be explored from various perspectives. Understanding ${topic} is essential for gaining a comprehensive knowledge of the subject matter. The field encompasses both theoretical and practical aspects, including key concepts and real-world applications.`,
        type: selectedType,
        difficulty: selectedDifficulty,
        category: selectedCategory,
        model: selectedModel,
        ratings: {},
      }

      setQuestions([...questions, newQuestion])
      setIsGenerating(false)
      setExpandedQuestion(newQuestion.id)
    }, 1500)
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
    if (expandedQuestion === id) {
      setExpandedQuestion(null)
    }
  }

  const handleAddQuestion = () => {
    document.getElementById("topic-input")?.focus()
  }

  const handleRateQuestion = (id: string, category: "scientific" | "clarity" | "helpfulness", rating: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            ratings: {
              ...q.ratings,
              [category]: rating,
            },
          }
        }
        return q
      }),
    )
  }

  const handleWouldUse = (id: string, wouldUse: boolean) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            ratings: {
              ...q.ratings,
              wouldUse,
            },
          }
        }
        return q
      }),
    )
  }

  const handleSubmitRating = async (id: string) => {
    if (!userData) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit ratings",
        variant: "destructive",
      })
      return
    }

    const question = questions.find((q) => q.id === id)
    if (!question) return

    try {
      // Format the data according to the required structure
      const quizData = {
        category: question.category.toLowerCase(),
        difficulty: question.difficulty.toLowerCase(),
        model: question.model.toLowerCase().replace(/\s+/g, "-").replace("70b", "70b").replace("8x7b", "8x7b"),
        questionType: question.type.toLowerCase().replace(/\s+/g, "-"),
        topic: topic.toLowerCase(),
        userId: userData.id,
        username: userData.username,
        generated: {
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          question: question.question,
          type: question.type.toLowerCase().replace(/\s+/g, "-"),
          incorrectOptions: question.incorrectOptions,
        },
        ratings: question.ratings || {}
      }

      // Save the quiz data to Firebase
      const result = await saveQuizQuestion(quizData)

      if (result.success) {
        // Set success state for this question
        setSubmissionSuccess((prev) => ({
          ...prev,
          [id]: true,
        }))

        // Wait for the success animation to complete (1.5 seconds)
        setTimeout(() => {
          // Remove the question from the UI
          setQuestions(questions.filter((q) => q.id !== id))
          
          // If the removed question was expanded, collapse it
          if (expandedQuestion === id) {
            setExpandedQuestion(null)
          }

          // Clear success state
          setSubmissionSuccess((prev) => ({
            ...prev,
            [id]: false,
          }))

          toast({
            title: "Quiz saved",
            description: "Your quiz question and ratings have been saved successfully",
            variant: "default",
          })
        }, 1500)
      }
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast({
        title: "Submission failed",
        description: "There was an error saving your quiz. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Quiz Creation</h2>
          </div>

          <Card className="border border-border mb-6 overflow-hidden bg-card">
            <CardContent className="p-4 relative">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-foreground mb-1">Instructions</h3>
                  <p className="text-sm text-muted-foreground mb-2">Follow these steps to create a quiz:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-5 list-decimal">
                    <li>Click "Add Question" to start</li>
                    <li>Enter your topic</li>
                    <li>Select difficulty level</li>
                    <li>Choose question type</li>
                    <li>Select category</li>
                    <li>Try generating with different LLM models to compare outputs</li>
                    <li>Rate each generated question</li>
                    <li>Save your quiz when satisfied</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAddQuestion}
              className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Card className="border border-border mb-6 bg-card">
          <CardContent className="p-6">
            <div className="relative mb-6">
              <Input
                id="topic-input"
                placeholder="Enter topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background border-input pl-10 h-12 rounded-md"
              />
              <Sparkles className="absolute left-3 top-3.5 h-5 w-5 text-primary" />
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium mb-3 text-foreground">Select Model</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(modelColors).map(([model, colors]) => (
                    <Badge
                      key={model}
                      variant="outline"
                      className={`cursor-pointer px-3 py-1.5 rounded-md border transition-all duration-300 ${
                        selectedModel === model
                          ? `${colors.bg} ${colors.border} ${colors.text}`
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => setSelectedModel(model as Model)}
                    >
                      <span className="mr-1.5">{colors.icon}</span>
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3 text-foreground">Difficulty Level</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(difficultyColors).map(([difficulty, colors]) => (
                    <Badge
                      key={difficulty}
                      variant="outline"
                      className={`cursor-pointer px-3 py-1.5 rounded-md border transition-all duration-300 ${
                        selectedDifficulty === difficulty
                          ? `${colors.bg} ${colors.border} ${colors.text}`
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => setSelectedDifficulty(difficulty as Difficulty)}
                    >
                      <span className="mr-1.5">{colors.icon}</span>
                      {difficulty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3 text-foreground">Question Type</p>
                <div className="flex flex-wrap gap-2">
                  {["Multiple Choice", "True/False", "Open Ended", "Short Answer", "Numerical"].map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={`cursor-pointer px-3 py-1.5 rounded-md border transition-all duration-300 ${
                        selectedType === type
                          ? "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => setSelectedType(type as QuestionType)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3 text-foreground">Category</p>
                <div className="flex flex-wrap gap-2">
                  {["Conceptual", "Application", "Context"].map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className={`cursor-pointer px-3 py-1.5 rounded-md border transition-all duration-300 ${
                        selectedCategory === category
                          ? "bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                      onClick={() => setSelectedCategory(category as Category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base mt-4"
                onClick={handleGenerateQuestion}
                disabled={!topic.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Question...
                  </>
                ) : (
                  "Generate Question"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {questions.length === 0 ? (
          <Alert className="bg-muted border-border">
            <div className="flex items-center">
              <HelpCircle className="h-5 w-5 text-primary mr-2" />
              <AlertDescription className="text-foreground">
                No questions added yet. Enter a topic and click "Generate Question" to create your first question.
              </AlertDescription>
            </div>
          </Alert>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {questions.map((question) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border border-border bg-card overflow-hidden transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge
                              variant="outline"
                              className={`px-2.5 py-1 rounded-md ${modelColors[question.model].bg} ${modelColors[question.model].border} ${modelColors[question.model].text}`}
                            >
                              <span className="mr-1">{modelColors[question.model].icon}</span>
                              {question.model}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`px-2.5 py-1 rounded-md ${difficultyColors[question.difficulty].bg} ${difficultyColors[question.difficulty].border} ${difficultyColors[question.difficulty].text}`}
                            >
                              {difficultyColors[question.difficulty].icon}
                              <span className="ml-1">{question.difficulty}</span>
                            </Badge>
                            <Badge
                              variant="outline"
                              className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                            >
                              {question.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="px-2.5 py-1 rounded-md bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
                            >
                              {question.category}
                            </Badge>
                          </div>

                          <div
                            className="cursor-pointer transition-all duration-300 hover:bg-muted p-3 rounded-md"
                            onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                          >
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-foreground">Question:</p>
                              {expandedQuestion === question.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <p className="mt-2 text-foreground">{question.question}</p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded-full"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {expandedQuestion === question.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-md p-4">
                              <div className="flex items-center mb-2">
                                <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400 mr-2" />
                                <p className="font-medium text-green-800 dark:text-green-300">Correct Answer:</p>
                              </div>
                              <p className="text-green-800 dark:text-green-300 pl-6">{question.correctAnswer}</p>
                            </div>

                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-md p-4">
                              <div className="flex items-center mb-2">
                                <XCircle className="h-4 w-4 text-red-700 dark:text-red-400 mr-2" />
                                <p className="font-medium text-red-800 dark:text-red-300">Incorrect Options:</p>
                              </div>
                              <ul className="list-disc pl-10 space-y-2 text-red-800 dark:text-red-300">
                                {question.incorrectOptions.map((option, index) => (
                                  <li key={index}>{option}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 rounded-md p-4">
                              <div className="flex items-center mb-2">
                                <HelpCircle className="h-4 w-4 text-blue-700 dark:text-blue-400 mr-2" />
                                <p className="font-medium text-blue-800 dark:text-blue-300">Explanation:</p>
                              </div>
                              <p className="text-blue-800 dark:text-blue-300 pl-6">{question.explanation}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-border">
                              <p className="font-medium text-foreground mb-4">Rate this Question</p>

                              <div className="space-y-5">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Scientific Accuracy</p>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <button
                                        key={rating}
                                        onClick={() => handleRateQuestion(question.id, "scientific", rating)}
                                        className={`p-1 transition-all duration-300 ${
                                          question.ratings?.scientific === rating
                                            ? "text-yellow-500 scale-110"
                                            : question.ratings?.scientific && question.ratings.scientific >= rating
                                              ? "text-yellow-500"
                                              : "text-muted-foreground hover:text-yellow-500"
                                        }`}
                                      >
                                        <Star
                                          className="h-6 w-6"
                                          fill={
                                            question.ratings?.scientific && question.ratings.scientific >= rating
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Clarity</p>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <button
                                        key={rating}
                                        onClick={() => handleRateQuestion(question.id, "clarity", rating)}
                                        className={`p-1 transition-all duration-300 ${
                                          question.ratings?.clarity === rating
                                            ? "text-yellow-500 scale-110"
                                            : question.ratings?.clarity && question.ratings.clarity >= rating
                                              ? "text-yellow-500"
                                              : "text-muted-foreground hover:text-yellow-500"
                                        }`}
                                      >
                                        <Star
                                          className="h-6 w-6"
                                          fill={
                                            question.ratings?.clarity && question.ratings.clarity >= rating
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Helpfulness</p>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <button
                                        key={rating}
                                        onClick={() => handleRateQuestion(question.id, "helpfulness", rating)}
                                        className={`p-1 transition-all duration-300 ${
                                          question.ratings?.helpfulness === rating
                                            ? "text-yellow-500 scale-110"
                                            : question.ratings?.helpfulness && question.ratings.helpfulness >= rating
                                              ? "text-yellow-500"
                                              : "text-muted-foreground hover:text-yellow-500"
                                        }`}
                                      >
                                        <Star
                                          className="h-6 w-6"
                                          fill={
                                            question.ratings?.helpfulness && question.ratings.helpfulness >= rating
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Would you use this LLM for similar queries?
                                  </p>
                                  <div className="flex gap-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`flex items-center gap-1.5 transition-all duration-300 ${
                                        question.ratings?.wouldUse === true
                                          ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                      }`}
                                      onClick={() => handleWouldUse(question.id, true)}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                      Yes
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`flex items-center gap-1.5 transition-all duration-300 ${
                                        question.ratings?.wouldUse === false
                                          ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                      }`}
                                      onClick={() => handleWouldUse(question.id, false)}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                      No
                                    </Button>
                                  </div>
                                </div>

                                <Button
                                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4 relative overflow-hidden"
                                  onClick={() => handleSubmitRating(question.id)}
                                  disabled={
                                    !question.ratings?.scientific ||
                                    !question.ratings?.clarity ||
                                    !question.ratings?.helpfulness ||
                                    question.ratings?.wouldUse === undefined ||
                                    submissionSuccess[question.id]
                                  }
                                >
                                  <motion.div
                                    className="absolute inset-0 bg-primary/20"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: submissionSuccess[question.id] ? 1 : 0 }}
                                    transition={{ duration: 0.3 }}
                                  />
                                  <motion.div
                                    className="flex items-center justify-center gap-2"
                                    initial={{ opacity: 1 }}
                                    animate={{ opacity: submissionSuccess[question.id] ? 0 : 1 }}
                                  >
                                    <motion.span
                                      initial={{ scale: 1 }}
                                      animate={{ scale: submissionSuccess[question.id] ? 0 : 1 }}
                                      whileTap={{ scale: 0.95 }}
                                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                      Submit Rating
                                    </motion.span>
                                  </motion.div>
                                  <AnimatePresence>
                                    {submissionSuccess[question.id] && (
                                      <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                      >
                                        <motion.div
                                          className="flex items-center gap-2"
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.1 }}
                                        >
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                          >
                                            <CheckCircle className="h-5 w-5" />
                                          </motion.div>
                                          <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                          >
                                            Saved Successfully
                                          </motion.span>
                                        </motion.div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}


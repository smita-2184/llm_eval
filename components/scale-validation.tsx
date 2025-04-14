"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, HelpCircle, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { saveScaleValidation } from "@/lib/scale-validation-service"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

type ScaleValidationProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScaleValidation({ open, onOpenChange }: ScaleValidationProps) {
  // Understanding ratings (previously called "clearRating")
  const [scientificUnderstanding, setScientificUnderstanding] = useState<number | null>(null)
  // Agreement ratings
  const [scientificAgreement, setScientificAgreement] = useState<number | null>(null)
  // Suggestions
  const [scientificSuggestion, setScientificSuggestion] = useState("")

  const [clarityUnderstanding, setClarityUnderstanding] = useState<number | null>(null)
  const [clarityAgreement, setClarityAgreement] = useState<number | null>(null)
  // Suggestions
  const [claritySuggestion, setClaritySuggestion] = useState("")

  const [helpfulnessUnderstanding, setHelpfulnessUnderstanding] = useState<number | null>(null)
  const [helpfulnessAgreement, setHelpfulnessAgreement] = useState<number | null>(null)
  const [helpfulnessSuggestion, setHelpfulnessSuggestion] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { userData } = useAuth()
  const router = useRouter()

  // Inside the handleSubmit function, remove the router.refresh() call
  // since we're now using real-time updates
  const handleSubmit = async () => {
    if (!userData) {
      setError("You must be logged in to submit scale validations")
      return
    }

    // Validate that all required fields are filled
    if (
      !scientificUnderstanding ||
      !scientificAgreement ||
      !clarityUnderstanding ||
      !clarityAgreement ||
      !helpfulnessUnderstanding ||
      !helpfulnessAgreement
    ) {
      setError("Please rate all scales before submitting")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Format the data according to the required structure
      const validationData = {
        ratings: {
          scientific: {
            understanding: scientificUnderstanding,
            agreement: scientificAgreement,
            suggestions: scientificSuggestion,
          },
          clarity: {
            understanding: clarityUnderstanding,
            agreement: clarityAgreement,
            suggestions: claritySuggestion,
          },
          helpfulness: {
            understanding: helpfulnessUnderstanding,
            agreement: helpfulnessAgreement,
            suggestions: helpfulnessSuggestion,
          },
        },
        type: "user",
        userId: userData.id,
        username: userData.username,
      }

      // Save the validation data to Firebase
      const result = await saveScaleValidation(validationData)

      if (result.success) {
        setSuccess(true)

        // Reset form after 3 seconds and close the modal
        setTimeout(() => {
          resetForm()
          onOpenChange(false)

          // No need to refresh the page since we're using real-time updates now
        }, 3000)
      }
    } catch (err) {
      console.error("Error submitting scale validation:", err)
      setError("Failed to submit scale validation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setScientificUnderstanding(null)
    setScientificAgreement(null)
    setScientificSuggestion("")
    setClarityUnderstanding(null)
    setClarityAgreement(null)
    setClaritySuggestion("")
    setHelpfulnessUnderstanding(null)
    setHelpfulnessAgreement(null)
    setHelpfulnessSuggestion("")
    setSuccess(false)
    setError(null)
  }

  const RatingButton = ({ value, selected, onClick }: { value: number; selected: boolean; onClick: () => void }) => (
    <button
      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
        selected
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-800 dark:text-gray-800 border border-gray-300 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {value}
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">Rating Guide & Scale Validation</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-300">Success</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              Your scale validation has been submitted successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left Column - Rating Guide */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Rating Guide</h3>

            {/* Scientific Accuracy */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-3">Scientific Accuracy</h4>

              <div className="space-y-3">
                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
                      <span className="text-sm text-muted-foreground">(5 points)</span>
                    </div>
                    <p className="text-sm">
                      Response demonstrates comprehensive understanding of scientific concepts with accurate,
                      well-supported explanations.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                      <span className="text-sm text-muted-foreground">(4 points)</span>
                    </div>
                    <p className="text-sm">
                      Response shows strong understanding with mostly accurate scientific information and good
                      supporting evidence.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Good</span>
                      <span className="text-sm text-muted-foreground">(3 points)</span>
                    </div>
                    <p className="text-sm">
                      Response shows adequate understanding with generally accurate information but could use more
                      support.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Fair</span>
                      <span className="text-sm text-muted-foreground">(2 points)</span>
                    </div>
                    <p className="text-sm">
                      Response contains some scientific inaccuracies or lacks proper supporting evidence.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Poor</span>
                      <span className="text-sm text-muted-foreground">(1 point)</span>
                    </div>
                    <p className="text-sm">Response contains significant scientific errors or misunderstandings.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clarity */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-3">Clarity</h4>

              <div className="space-y-3">
                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
                      <span className="text-sm text-muted-foreground">(5 points)</span>
                    </div>
                    <p className="text-sm">
                      Response is exceptionally clear, well-structured, and easy to understand with appropriate use of
                      technical terms.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                      <span className="text-sm text-muted-foreground">(4 points)</span>
                    </div>
                    <p className="text-sm">
                      Response is clear and well-organized with minor areas that could be improved.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Good</span>
                      <span className="text-sm text-muted-foreground">(3 points)</span>
                    </div>
                    <p className="text-sm">Response is mostly clear but has some areas that need better explanation.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Fair</span>
                      <span className="text-sm text-muted-foreground">(2 points)</span>
                    </div>
                    <p className="text-sm">Response has several unclear explanations or confusing structure.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Poor</span>
                      <span className="text-sm text-muted-foreground">(1 point)</span>
                    </div>
                    <p className="text-sm">
                      Response is difficult to understand with poor organization or unclear explanations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpfulness */}
            <div>
              <h4 className="font-medium text-lg mb-3">Helpfulness</h4>

              <div className="space-y-3">
                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
                      <span className="text-sm text-muted-foreground">(5 points)</span>
                    </div>
                    <p className="text-sm">
                      Response provides comprehensive, practical insights that directly address the query with valuable
                      examples.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                      <span className="text-sm text-muted-foreground">(4 points)</span>
                    </div>
                    <p className="text-sm">Response is very helpful with good examples and practical applications.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Good</span>
                      <span className="text-sm text-muted-foreground">(3 points)</span>
                    </div>
                    <p className="text-sm">
                      Response is helpful but could provide more detailed examples or applications.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Fair</span>
                      <span className="text-sm text-muted-foreground">(2 points)</span>
                    </div>
                    <p className="text-sm">Response provides basic information but lacks depth or practical utility.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-3 rounded-full"></div>
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Poor</span>
                      <span className="text-sm text-muted-foreground">(1 point)</span>
                    </div>
                    <p className="text-sm">
                      Response offers little practical value or fails to address the core query.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Scale Validation */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-semibold">Scale Validation</h3>
            </div>

            <Card className="mb-6 bg-blue-50/10 border-blue-200/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400">Help Us Improve</h4>
                    <p className="text-sm text-muted-foreground">
                      Please rate the clarity and effectiveness of our rating scales. Your feedback will help us improve
                      the evaluation process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scientific Accuracy Validation */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-4">Scientific Accuracy</h4>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">How clear is this rating scale? (Understanding)</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <RatingButton
                        key={value}
                        value={value}
                        selected={scientificUnderstanding === value}
                        onClick={() => setScientificUnderstanding(value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Do you agree with the scoring criteria? (Agreement)</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <RatingButton
                        key={value}
                        value={value}
                        selected={scientificAgreement === value}
                        onClick={() => setScientificAgreement(value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Suggestions for improvement</p>
                  <Textarea
                    placeholder="What would make this rating scale more clear or effective?"
                    value={scientificSuggestion}
                    onChange={(e) => setScientificSuggestion(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>
            </div>

            {/* Clarity Validation */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-4">Clarity</h4>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">How clear is this rating scale? (Understanding)</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <RatingButton
                        key={value}
                        value={value}
                        selected={clarityUnderstanding === value}
                        onClick={() => setClarityUnderstanding(value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Do you agree with the scoring criteria? (Agreement)</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <RatingButton
                        key={value}
                        value={value}
                        selected={clarityAgreement === value}
                        onClick={() => setClarityAgreement(value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Suggestions for improvement</p>
                  <Textarea
                    placeholder="What would make this rating scale more clear or effective?"
                    value={claritySuggestion}
                    onChange={(e) => setClaritySuggestion(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>
            </div>

            {/* Helpfulness Validation */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-4">Helpfulness</h4>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">How clear is this rating scale? (Understanding)</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <RatingButton
                        key={value}
                        value={value}
                        selected={helpfulnessUnderstanding === value}
                        onClick={() => setHelpfulnessUnderstanding(value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Do you agree with the scoring criteria? (Agreement)</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <RatingButton
                        key={value}
                        value={value}
                        selected={helpfulnessAgreement === value}
                        onClick={() => setHelpfulnessAgreement(value)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Suggestions for improvement</p>
                  <Textarea
                    placeholder="What would make this rating scale more clear or effective?"
                    value={helpfulnessSuggestion}
                    onChange={(e) => setHelpfulnessSuggestion(e.target.value)}
                    className="h-24"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 flex items-center justify-center gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || success}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submitted Successfully
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Scale Validation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


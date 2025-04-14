"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Sample test data
const sampleTest = {
  title: "Chemistry LLM Evaluation Test",
  questions: [
    {
      id: 1,
      question: "Which LLM provided the most scientifically accurate response to the question about chemical bonding?",
      options: ["GPT-4", "GPT-3.5", "Gemini Pro", "LLaMA"],
    },
    {
      id: 2,
      question: "Rate the clarity of the explanation about molecular structures provided by Mixtral:",
      options: ["Poor", "Fair", "Good", "Excellent"],
    },
    {
      id: 3,
      question: "Which model provided the most helpful response for solving the stoichiometry problem?",
      options: ["GPT-4", "GPT-3.5", "Gemini Pro", "LLaMA", "Mixtral"],
    },
  ],
}

export function TakeTest() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    // Here you would typically send the answers to your backend
    console.log("Submitted answers:", answers)
  }

  const allQuestionsAnswered = sampleTest.questions.every((q) => answers[q.id])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{sampleTest.title}</h2>

      {sampleTest.questions.map((question) => (
        <Card key={question.id} className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Question {question.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{question.question}</p>

            <RadioGroup value={answers[question.id]} onValueChange={(value) => handleAnswerChange(question.id, value)}>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${question.id}-option${index}`} disabled={isSubmitted} />
                    <Label htmlFor={`q${question.id}-option${index}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered || isSubmitted}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitted ? "Submitted" : "Submit Test"}
        </Button>
      </div>

      {isSubmitted && (
        <Card className="mt-6 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium text-green-800 mb-2">Test Submitted Successfully</h3>
            <p className="text-green-700">Thank you for completing the test. Your responses have been recorded.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function SurveyForm() {
  const [responses, setResponses] = useState({
    experience: "",
    scientificAccuracy: 50,
    clarity: 50,
    helpfulness: 50,
    feedback: "",
  })

  const handleSliderChange = (name: string, value: number[]) => {
    setResponses({
      ...responses,
      [name]: value[0],
    })
  }

  const handleSubmit = () => {
    console.log("Survey responses:", responses)
    // Here you would typically send the responses to your backend
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Evaluation Survey</CardTitle>
        <CardDescription>Please provide your feedback on the LLM responses you reviewed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">How much experience do you have with chemistry?</label>
          <Select
            value={responses.experience}
            onValueChange={(value) => setResponses({ ...responses, experience: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (High School level)</SelectItem>
              <SelectItem value="intermediate">Intermediate (Undergraduate)</SelectItem>
              <SelectItem value="advanced">Advanced (Graduate level)</SelectItem>
              <SelectItem value="expert">Expert (Professional/PhD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Scientific Accuracy (0-100)</label>
          <div className="flex items-center gap-4">
            <Slider
              value={[responses.scientificAccuracy]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleSliderChange("scientificAccuracy", value)}
              className="flex-1"
            />
            <span className="w-10 text-center">{responses.scientificAccuracy}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Clarity (0-100)</label>
          <div className="flex items-center gap-4">
            <Slider
              value={[responses.clarity]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleSliderChange("clarity", value)}
              className="flex-1"
            />
            <span className="w-10 text-center">{responses.clarity}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Helpfulness (0-100)</label>
          <div className="flex items-center gap-4">
            <Slider
              value={[responses.helpfulness]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => handleSliderChange("helpfulness", value)}
              className="flex-1"
            />
            <span className="w-10 text-center">{responses.helpfulness}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Additional Feedback</label>
          <Textarea
            placeholder="Please provide any additional feedback about the LLM responses..."
            value={responses.feedback}
            onChange={(e) => setResponses({ ...responses, feedback: e.target.value })}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Submit Survey
        </Button>
      </CardFooter>
    </Card>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export function RatingGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-purple-100 dark:bg-purple-900/30 py-4 px-6">
        <h1 className="text-lg font-medium text-foreground">Welcome, aashi</h1>
        <p className="text-sm text-muted-foreground">BSc • Semester 1 • chem</p>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Rating Guide</h2>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Rating Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Scientific Accuracy */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Scientific Accuracy</h3>

              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
                      <span className="text-sm text-muted-foreground">(5 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response demonstrates comprehensive understanding of scientific concepts with accurate,
                      well-supported explanations.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                      <span className="text-sm text-muted-foreground">(4 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response shows strong understanding with mostly accurate scientific information and good
                      supporting evidence.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Good</span>
                      <span className="text-sm text-muted-foreground">(3 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response shows adequate understanding with generally accurate information but could use more
                      support.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Fair</span>
                      <span className="text-sm text-muted-foreground">(2 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response contains some scientific inaccuracies or lacks proper supporting evidence.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Poor</span>
                      <span className="text-sm text-muted-foreground">(1 point)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response contains significant scientific errors or misunderstandings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clarity */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Clarity</h3>

              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
                      <span className="text-sm text-muted-foreground">(5 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response is exceptionally clear, well-structured, and easy to understand with appropriate use of
                      technical terms.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                      <span className="text-sm text-muted-foreground">(4 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response is clear and well-organized with minor areas that could be improved.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Good</span>
                      <span className="text-sm text-muted-foreground">(3 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response is mostly clear but has some areas that need better explanation.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Fair</span>
                      <span className="text-sm text-muted-foreground">(2 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response has several unclear explanations or confusing structure.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Poor</span>
                      <span className="text-sm text-muted-foreground">(1 point)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response is difficult to understand with poor organization or unclear explanations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpfulness */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Helpfulness</h3>

              <div className="space-y-4">
                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Excellent</span>
                      <span className="text-sm text-muted-foreground">(5 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response provides comprehensive, practical insights that directly address the query with valuable
                      examples.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                      <span className="text-sm text-muted-foreground">(4 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response is very helpful with good examples and practical applications.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Good</span>
                      <span className="text-sm text-muted-foreground">(3 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response is helpful but could provide more detailed examples or applications.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Fair</span>
                      <span className="text-sm text-muted-foreground">(2 points)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response provides basic information but lacks depth or practical utility.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="w-1 bg-blue-500 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Poor</span>
                      <span className="text-sm text-muted-foreground">(1 point)</span>
                    </div>
                    <p className="text-sm text-foreground">
                      Response offers little practical value or fails to address the core query.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          © 2023 EduQuest AI. All rights reserved. <span className="mx-2">|</span>{" "}
          <a href="#" className="hover:underline">
            Impressum
          </a>
        </footer>
      </main>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"

type RatingGuideModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RatingGuideModal({ open, onOpenChange }: RatingGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">Rating Guide</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Scientific Accuracy */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Scientific Accuracy</h3>

            <div className="space-y-4">
              <div className="flex">
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-blue-600 dark:text-blue-400">Very Good</span>
                    <span className="text-sm text-muted-foreground">(4 points)</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Response shows strong understanding with mostly accurate scientific information and good supporting
                    evidence.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
                <div className="w-1 bg-blue-500 mr-4 rounded-full"></div>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}


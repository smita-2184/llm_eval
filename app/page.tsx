import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserHeader } from "@/components/user-header"
import { ProgressSidebar } from "@/components/progress-sidebar"
import { LlmComparison } from "@/components/llm-comparison"
import { QuizCreation } from "@/components/quiz-creation"
import { EvaluationQA } from "@/components/evaluation-qa"
import { ProtectedRoute } from "@/components/protected-route"

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Left Sidebar */}
        <ProgressSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header - removed the hardcoded props */}
          <UserHeader />

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="llm-comparison" className="w-full">
                <TabsList className="mb-8 w-full justify-start bg-secondary p-1 rounded-xl">
                  <TabsTrigger
                    value="llm-comparison"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    LLM Comparison
                  </TabsTrigger>
                  <TabsTrigger
                    value="take-test"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Take Test
                  </TabsTrigger>
                  <TabsTrigger
                    value="quiz-creation"
                    className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Quiz Creation
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="llm-comparison">
                  <LlmComparison />
                </TabsContent>

                <TabsContent value="take-test">
                  <EvaluationQA />
                </TabsContent>

                <TabsContent value="quiz-creation">
                  <QuizCreation />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}


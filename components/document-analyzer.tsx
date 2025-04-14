"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Send, FileText, Link2, AlertCircle, MessageSquare, RefreshCw, Upload, FileUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { analyzeDocumentUrl, startDocumentChat, continueDocumentChat } from "@/app/actions/analyze-document"
import { uploadPdf } from "@/app/actions/upload-document"
import ReactMarkdown from "react-markdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export function DocumentAnalyzer() {
  const [documentUrl, setDocumentUrl] = useState("")
  const [question, setQuestion] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("url")
  const [documentPart, setDocumentPart] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatMode, setChatMode] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleAnalyzeDocument = async () => {
    if (!documentUrl) return

    setIsAnalyzing(true)
    setError(null)
    setResult("")
    setChatMode(false)

    try {
      const analysisResult = await analyzeDocumentUrl(documentUrl, question || "Summarize this document")

      if (analysisResult.error) {
        setError(analysisResult.error)
      } else {
        setResult(analysisResult.text)
      }
    } catch (err: any) {
      console.error("Error analyzing document:", err)
      setError(`Failed to analyze document: ${err.message || "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartChat = async () => {
    if (!documentUrl) return

    setIsProcessing(true)
    setError(null)
    setMessages([])
    setChatMode(true)

    try {
      const part = await startDocumentChat(documentUrl)
      setDocumentPart(part)

      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content: "I've loaded your document. What would you like to know about it?",
        },
      ])
    } catch (err: any) {
      console.error("Error starting document chat:", err)
      setError(`Failed to start document chat: ${err.message || "Unknown error"}`)
      setChatMode(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!question.trim() || !documentPart) return

    // Add user message
    const userMessage = { role: "user", content: question }
    setMessages((prev) => [...prev, userMessage])

    // Clear input
    setQuestion("")
    setIsProcessing(true)

    try {
      // Get response
      const result = await continueDocumentChat(documentPart, messages, question)

      if (result.error) {
        setError(result.error)
      } else {
        // Add assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: result.text }])
      }
    } catch (err: any) {
      console.error("Error in chat:", err)
      setError(`Failed to get response: ${err.message || "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setDocumentUrl("")
    setQuestion("")
    setResult("")
    setError(null)
    setDocumentPart(null)
    setMessages([])
    setChatMode(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    setChatMode(false)

    try {
      // Create FormData to send the file
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file using the server action
      const part = await uploadPdf(formData)
      setDocumentPart(part)

      // Add welcome message
      setMessages([
        {
          role: "assistant",
          content: `I've loaded your document "${file.name}". What would you like to know about it?`,
        },
      ])

      setChatMode(true)
    } catch (err: any) {
      console.error("Error uploading document:", err)
      setUploadError(`Failed to upload document: ${err.message || "Unknown error"}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      if (file.type !== "application/pdf") {
        setUploadError("Only PDF files are supported")
        return
      }

      // Create a new FileList with just this file
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files

        // Trigger the onChange event manually
        const changeEvent = new Event("change", { bubbles: true })
        fileInputRef.current.dispatchEvent(changeEvent)
      }
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="bg-primary/20 p-2 rounded-lg mr-3">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Document Analyzer</h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-secondary p-1 rounded-xl">
          <TabsTrigger
            value="url"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Document URL
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Upload Document
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <Card className="bg-card border-border/40 shadow-lg overflow-hidden mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Enter PDF Document URL
              </CardTitle>
              <CardDescription>Provide a URL to a PDF document to analyze with AI</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <Input
                placeholder="https://example.com/document.pdf"
                className="mb-4 bg-secondary/50 border-border/40"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
              />

              {!chatMode && !documentPart && (
                <div className="flex gap-2">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleAnalyzeDocument}
                    disabled={isAnalyzing || !documentUrl}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Analyze Document
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="border-primary/50 text-primary"
                    onClick={handleStartChat}
                    disabled={isProcessing || !documentUrl}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat with Document
                      </>
                    )}
                  </Button>
                </div>
              )}

              {(chatMode || documentPart) && (
                <Button variant="outline" className="border-border/40 text-muted-foreground" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </CardContent>
          </Card>

          {chatMode && documentPart && (
            <Card className="bg-card border-border/40 shadow-lg overflow-hidden mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Chat with Document
                </CardTitle>
                <CardDescription>Ask questions about the document and get AI-powered answers</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="bg-secondary/30 p-4 rounded-lg mb-4 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            message.role === "user" ? "bg-primary/20 text-foreground" : "bg-secondary text-foreground"
                          }`}
                        >
                          <div className="whitespace-pre-line">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about the document..."
                    className="bg-secondary/50 border-border/40"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleSendMessage}
                    disabled={isProcessing || !question.trim()}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {result && !chatMode && (
            <Card className="bg-card border-border/40 shadow-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Analysis Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/30 p-4 rounded-lg whitespace-pre-line">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload">
          <Card className="bg-card border-border/40 shadow-lg overflow-hidden mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Upload PDF Document
              </CardTitle>
              <CardDescription>Upload a PDF document to analyze with Gemini</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {uploadError && (
                <Alert variant="destructive" className="mb-4 border-destructive/20 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {!chatMode && !documentPart && (
                <div
                  className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Drag and drop your PDF here, or click to browse</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Select PDF File
                      </>
                    )}
                  </Button>
                </div>
              )}

              {(chatMode || documentPart) && (
                <Button variant="outline" className="border-border/40 text-muted-foreground" onClick={handleReset}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              )}
            </CardContent>
          </Card>

          {chatMode && documentPart && (
            <Card className="bg-card border-border/40 shadow-lg overflow-hidden mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Chat with Document
                </CardTitle>
                <CardDescription>Ask questions about the document and get AI-powered answers</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="bg-secondary/30 p-4 rounded-lg mb-4 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            message.role === "user" ? "bg-primary/20 text-foreground" : "bg-secondary text-foreground"
                          }`}
                        >
                          <div className="whitespace-pre-line">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about the document..."
                    className="bg-secondary/50 border-border/40"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleSendMessage}
                    disabled={isProcessing || !question.trim()}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


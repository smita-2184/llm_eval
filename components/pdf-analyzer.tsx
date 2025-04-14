"use client"

import React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Send, FileText, AlertCircle, MessageSquare, RefreshCw, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { analyzePdfWithGemini } from "@/lib/gemini-client"
import { fetchApiKeys } from "@/lib/api-service"
import ReactMarkdown from "react-markdown"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export function PdfAnalyzer() {
  const [documentUrl, setDocumentUrl] = useState("")
  const [question, setQuestion] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
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
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleAnalyzeDocument = async () => {
    if (!documentUrl) return

    setIsAnalyzing(true)
    setError(null)
    setChatMode(false)

    try {
      // Fetch API keys
      const apiKeyStatus = await fetchApiKeys()

      if (!apiKeyStatus.validKeys.gemini || !apiKeyStatus.keys["google-key"]) {
        throw new Error("Google Gemini API key is missing or invalid")
      }

      const apiKey = apiKeyStatus.keys["google-key"] || ""

      // Create a file part from the URL
      const response = await fetch(documentUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`)
      }

      const fileBlob = await response.blob()
      const fileData = {
        inlineData: {
          data: await blobToBase64(fileBlob),
          mimeType: "application/pdf",
        },
      }

      // Analyze the document with Gemini
      const result = await analyzePdfWithGemini(apiKey, fileData, question || "Summarize this document")

      if (result.error) {
        setError(result.error)
      } else {
        // Add the result to messages
        setMessages([
          { role: "user", content: question || "Summarize this document" },
          { role: "assistant", content: result.text },
        ])
        setChatMode(true)
        setDocumentPart(JSON.stringify(fileData))
      }
    } catch (err: any) {
      console.error("Error analyzing document:", err)
      setError(`Failed to analyze document: ${err.message || "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
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
      // Fetch API keys
      const apiKeyStatus = await fetchApiKeys()

      if (!apiKeyStatus.validKeys.gemini || !apiKeyStatus.keys["google-key"]) {
        throw new Error("Google Gemini API key is missing or invalid")
      }

      const apiKey = apiKeyStatus.keys["google-key"] || ""

      // Parse the document part
      const fileData = JSON.parse(documentPart)

      // Analyze with Gemini
      const result = await analyzePdfWithGemini(apiKey, fileData, question)

      if (result.error) {
        setError(result.error)
      } else {
        // Add assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: result.text }])
      }
    } catch (err: any) {
      console.error("Error in chat:", err)
      setError(`Failed to get response: ${err.message || "Unknown error"}`)
      setMessages((prev) => [...prev, { role: "system", content: `Error: ${err.message}` }])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setDocumentUrl("")
    setQuestion("")
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
      // Fetch API keys
      const apiKeyStatus = await fetchApiKeys()

      if (!apiKeyStatus.validKeys.gemini || !apiKeyStatus.keys["google-key"]) {
        throw new Error("Google Gemini API key is missing or invalid")
      }

      const apiKey = apiKeyStatus.keys["google-key"] || ""

      // Convert file to base64
      const fileData = {
        inlineData: {
          data: await fileToBase64(file),
          mimeType: file.type,
        },
      }

      setDocumentPart(JSON.stringify(fileData))

      // Add system message
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

  // Helper function to convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = base64String.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        // Remove the data URL prefix
        const base64 = base64String.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
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
        <h2 className="text-2xl font-bold">PDF Analyzer with Gemini</h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 border-destructive/20 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-card border-border/40 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
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
                      <Upload className="mr-2 h-4 w-4" />
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

        <Card className="bg-card border-border/40 shadow-lg overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Enter PDF Document URL
            </CardTitle>
            <CardDescription>Provide a URL to a PDF document to analyze with Gemini</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <Input
              placeholder="https://example.com/document.pdf"
              className="mb-4 bg-secondary/50 border-border/40"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />

            {!chatMode && !documentPart && (
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
            )}
          </CardContent>
        </Card>
      </div>

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
                        message.role === "user"
                          ? "bg-primary/20 text-foreground"
                          : message.role === "system"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-secondary text-foreground"
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
    </div>
  )
}


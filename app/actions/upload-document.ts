"use server"
import { bufferPdfToPart } from "@/lib/remote-pdf-to-part"
import { fetchApiKeys } from "@/lib/api-service"

export async function uploadPdf(formData: FormData) {
  try {
    // Fetch API keys from Firebase
    const apiKeyStatus = await fetchApiKeys()
    const apiKeys = apiKeyStatus.keys

    if (!apiKeyStatus.validKeys.gemini || !apiKeys["google-key"]) {
      throw new Error("Google Gemini API key is missing or invalid")
    }

    const apiKey = apiKeys["google-key"] || ""

    // Get the file from the form data
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("No file uploaded")
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are supported")
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use the bufferPdfToPart function to handle the upload
    const part = await bufferPdfToPart(buffer, apiKey, file.name)

    // Return the part object as a string
    return JSON.stringify(part)
  } catch (error: any) {
    console.error("Error uploading PDF:", error)
    throw new Error(`Failed to upload PDF: ${error.message || "Unknown error"}`)
  }
}


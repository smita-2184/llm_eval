"use server"

import { v4 as uuidv4 } from "uuid"

/**
 * Uploads a PDF from a Buffer to Google AI File Manager
 * This is useful for handling uploaded files from forms
 */
export async function bufferPdfToPart(buffer: Buffer, apiKey: string, displayName: string) {
  try {
    // Convert buffer to base64
    const base64Data = buffer.toString("base64")

    // Create a part object for Gemini API
    const part = {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf",
      },
    }

    console.log(`PDF converted to base64 for "${displayName}"`)

    return part
  } catch (error) {
    console.error("Error in bufferPdfToPart:", error)
    throw error
  }
}

/**
 * Fetches a PDF from a URL and converts it to a part object for Gemini API
 */
export async function remotePdfToPart(url: string, apiKey: string, displayName?: string) {
  try {
    console.log(`Fetching PDF from ${url}...`)

    // Fetch the PDF from the URL
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
    }

    // Get the PDF as an ArrayBuffer
    const pdfBuffer = await response.arrayBuffer()

    // Convert to base64
    const base64Data = Buffer.from(pdfBuffer).toString("base64")

    // Create a part object for Gemini API
    const part = {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf",
      },
    }

    console.log(`PDF converted to base64 for "${displayName || "PDF-" + uuidv4()}"`)

    return part
  } catch (error) {
    console.error("Error in remotePdfToPart:", error)
    throw error
  }
}


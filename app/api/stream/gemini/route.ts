import { streamGemini } from "@/app/actions/stream-response"
import { fetchApiKeys } from "@/lib/api-service"

export async function POST(req: Request) {
  try {
    const { question } = await req.json()

    const apiKeyStatus = await fetchApiKeys()

    if (!apiKeyStatus.validKeys.gemini) {
      return new Response(JSON.stringify({ error: "Gemini API key is missing or invalid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return streamGemini(question, apiKeyStatus.keys["google-key"] || "")
  } catch (error: any) {
    console.error("Gemini streaming error:", error)
    return new Response(JSON.stringify({ error: error.message || "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


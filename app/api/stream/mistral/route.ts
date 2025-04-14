import { streamMixtral } from "@/app/actions/stream-response"
import { fetchApiKeys } from "@/lib/api-service"

export async function POST(req: Request) {
  try {
    const { question } = await req.json()

    const apiKeyStatus = await fetchApiKeys()

    if (!apiKeyStatus.validKeys.together) {
      return new Response(JSON.stringify({ error: "Together API key is missing or invalid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return streamMixtral(question, apiKeyStatus.keys["mixtral-key"] || "")
  } catch (error: any) {
    console.error("Mixtral streaming error:", error)
    return new Response(JSON.stringify({ error: error.message || "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


import { streamDocumentChat } from "@/app/actions/analyze-document"

export async function POST(req: Request) {
  try {
    const { documentPart, messages, question } = await req.json()

    if (!documentPart || !question) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Call the streaming function
    return streamDocumentChat(documentPart, messages, question)
  } catch (error: any) {
    console.error("Error in stream-document-chat API:", error)
    return new Response(JSON.stringify({ error: error.message || "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


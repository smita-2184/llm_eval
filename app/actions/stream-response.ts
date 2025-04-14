"use server"

import { StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Mistral } from "@mistralai/mistralai"

export async function streamOpenAI(question: string, apiKey: string) {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    })

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    })

    return new StreamingTextResponse(response)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to stream from OpenAI" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function streamGemini(question: string, apiKey: string) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction:
        "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
    })

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
    }

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: question }] }],
      generationConfig,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to stream from Gemini" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function streamMistral(question: string, apiKey: string) {
  try {
    const client = new Mistral({ apiKey })

    const response = await client.chat.stream({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.data.choices[0].delta.content
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to stream from Mistral" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function streamGroq(question: string, apiKey: string) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error ${response.status}`)
    }

    return new StreamingTextResponse(response.body!)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to stream from Groq" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function streamDeepSeek(question: string, apiKey: string) {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.deepseek.com/v1",
      dangerouslyAllowBrowser: true,
    })

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a chemistry expert. Provide a detailed, scientifically accurate response to the question. Include relevant chemical concepts, reactions, and explanations.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    })

    return new StreamingTextResponse(response)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to stream from DeepSeek" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function streamMixtral(question: string, apiKey: string) {
  try {
    const response = await fetch("https://api.together.xyz/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt: `<s>[INST] You are a chemistry expert. Provide a detailed, scientifically accurate response to this question: ${question} [/INST]`,
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error ${response.status}`)
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }
            // Process and enqueue the chunk
            const chunk = decoder.decode(value)
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (e) {
          controller.error(e)
        } finally {
          reader.releaseLock()
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Failed to stream from Mixtral" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}


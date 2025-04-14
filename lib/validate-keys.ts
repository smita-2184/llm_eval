export function isValidOpenAIKey(key: string | undefined): boolean {
  // Check if it's a valid OpenAI key format
  return (
    typeof key === "string" &&
    key.trim().length > 20 &&
    !key.includes("your_openai_api_key_here") &&
    !key.includes("sk-proj-uk5Xxo0glvLrA2wkm6GlQwScmDhwvlCil452")
  )
}

export function isValidGeminiKey(key: string | undefined): boolean {
  // Check if it's a valid Google API key format
  return typeof key === "string" && key.trim().length > 20 && !key.includes("your_gemini_api_key_here")
}

export function isValidGroqKey(key: string | undefined): boolean {
  // Check if it's a valid Groq key format
  return typeof key === "string" && key.trim().length > 10 && !key.includes("your_together_api_key_here")
}

export function isValidTogetherKey(key: string | undefined): boolean {
  // Check if it's a valid Together API key
  return typeof key === "string" && key.trim().length > 10 && !key.includes("your_together_api_key_here")
}


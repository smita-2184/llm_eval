"use server"

import OpenAI from "openai"

// Updated to match the new implementation pattern with better error handling
export async function createServerOpenAIClient(apiKey: string, baseURL?: string) {
  // Validate the API key is a non-empty string
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error("OpenAI API key is required and must be a non-empty string")
  }

  // Configure OpenAI with the provided API key
  const config: any = {
    apiKey: apiKey.trim(),
    dangerouslyAllowBrowser: true, // WARNING: Security risk - only use for development
  }

  if (baseURL && typeof baseURL === "string") {
    config.baseURL = baseURL
  }

  return new OpenAI(config)
}


import { Mistral } from '@mistralai/mistralai';

export function createMistralClient(apiKey: string) {
  return new Mistral({ apiKey: apiKey });
}

export { Mistral }; 
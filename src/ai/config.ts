import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Model configuration
export const MODELS = {
  PRIMARY: 'googleai/gemini-2.5-flash',
  FALLBACK: 'googleai/gemini-2.5-flash-lite',
} as const;

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: MODELS.PRIMARY,
});

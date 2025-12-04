import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TranslationConfig } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Translates a batch of text strings ensuring strictly formatted JSON output.
 */
export const translateBatch = async (
  texts: string[],
  config: TranslationConfig,
  onLog?: (type: 'request' | 'response' | 'error', message: string, details?: any) => void
): Promise<string[]> => {
  const ai = getClient();
  
  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.STRING
    },
    description: "Array of translated strings corresponding exactly to the input array."
  };

  // Inject target language into the template
  const systemInstruction = config.systemPrompt.replace('${TARGET_LANG}', config.targetLanguage);

  const payload = {
    model: 'gemini-2.5-flash',
    contents: JSON.stringify(texts),
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: config.temperature,
    },
  };

  if (onLog) {
    onLog('request', `Sending batch of ${texts.length} strings`, payload);
  }

  try {
    const response = await ai.models.generateContent(payload);

    if (onLog) {
      onLog('response', `Received response`, response);
    }

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed)) {
        if (parsed.length !== texts.length) {
          console.warn(`Mismatch in batch size. Expected ${texts.length}, got ${parsed.length}`);
        }
        return parsed as string[];
      }
    }
    throw new Error("Invalid response format from AI");
  } catch (error) {
    if (onLog) {
      onLog('error', `Translation failed`, error);
    }
    console.error("Translation error:", error);
    throw error;
  }
};
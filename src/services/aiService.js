import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using Gemini 2.5 Flash as requested.
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Ultra-robust JSON parser for AI responses.
 * Attempts multiple extraction strategies to recover valid data.
 */
const parseGeminiJson = (text) => {
  const cleanAndParse = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  // 1. Level 1: Direct Parse
  let parsed = cleanAndParse(text);
  if (parsed) return postProcess(parsed);

  // 2. Level 2: Regex Array Match (Largest [ ... ] block)
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    parsed = cleanAndParse(arrayMatch[0]);
    if (parsed) return postProcess(parsed);
  }

  // 3. Level 3: Regex Object Match (Largest { ... } block)
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    parsed = cleanAndParse(objectMatch[0]);
    if (parsed) return postProcess(parsed);
  }

  // 4. Level 4: Truncation Recovery (For [ ... sequences that didn't close)
  if (text.includes('[') && !text.includes(']')) {
    const fixedText = text + ']';
    parsed = cleanAndParse(fixedText);
    if (parsed) return postProcess(parsed);
  }

  console.error('Failed to parse Gemini JSON. Raw Response Snippet:', text.substring(0, 1000));
  throw new Error('AI Response was not in a recognizable JSON format. The response might have been truncated or censored.');
};

/**
 * Ensures the parsed JSON is in the expected final format (usually an array)
 */
const postProcess = (data) => {
  // If it's already an array, return it
  if (Array.isArray(data)) return data;
  
  // If it's an object, search its top-level keys for the first array
  // (Handles cases where AI returns { "questions": [...] })
  if (typeof data === 'object' && data !== null) {
     const innerArray = Object.values(data).find(val => Array.isArray(val));
     if (innerArray) return innerArray;
  }
  
  return data;
};

export const generateStudyMaterial = async (topic, prompt) => {
  if (!prompt) throw new Error('AI prompt is missing.');

  const isJsonExpected = prompt.toLowerCase().includes('json') || prompt.toLowerCase().includes('array');

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{ text: `${prompt} Topic: ${topic}` }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: isJsonExpected ? "application/json" : "text/plain"
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const candidate = response.data.candidates?.[0];
    
    if (candidate) {
      // Check for safety finish reason
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Instructional Safety: The AI model refused to generate this specific content for safety reasons.');
      }
      
      // Check for truncation
      if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('AI response was truncated due to token limits.');
      }

      if (candidate.content?.parts?.[0]?.text) {
        const rawContent = candidate.content.parts[0].text;
        
        if (isJsonExpected) {
          return parseGeminiJson(rawContent);
        }
        return rawContent;
      }
    }

    throw new Error('Empty or invalid response from AI model.');
  } catch (error) {
    console.error('Gemini API Error Context:', error);
    const message = error.response?.data?.error?.message || error.message;
    
    if (message.includes('quota')) {
      throw new Error('AI quota exceeded. Please wait a moment or check your API limit.');
    }
    throw new Error(`AI Synthesis System: ${message}`);
  }
};

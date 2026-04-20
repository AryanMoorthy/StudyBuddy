import axios from 'axios';

const PRIMARY_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SECONDARY_KEY = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;

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

  // 4. Level 4: Truncation Recovery
  if (text.includes('[') && !text.includes(']')) {
    const fixedText = text + ']';
    parsed = cleanAndParse(fixedText);
    if (parsed) return postProcess(parsed);
  }

  throw new Error('AI Response was not in a recognizable JSON format.');
};

const postProcess = (data) => {
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data !== null) {
     const innerArray = Object.values(data).find(val => Array.isArray(val));
     if (innerArray) return innerArray;
  }
  return data;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core Generation Logic with Failover Support
 */
export const generateStudyMaterial = async (topic, prompt, retryCount = 0, useSecondary = false) => {
  if (!prompt) throw new Error('AI prompt is missing.');

  const activeKey = (useSecondary && SECONDARY_KEY) ? SECONDARY_KEY : PRIMARY_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
  const isJsonExpected = prompt.toLowerCase().includes('json') || prompt.toLowerCase().includes('array');

  try {
    const response = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: `${prompt} Topic: ${topic}` }] }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: isJsonExpected ? "application/json" : "text/plain"
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    const candidate = response.data.candidates?.[0];
    if (candidate) {
      if (candidate.finishReason === 'SAFETY') throw new Error('Instructional Safety: Refused content.');
      if (candidate.content?.parts?.[0]?.text) {
        const rawContent = candidate.content.parts[0].text;
        if (isJsonExpected) return parseGeminiJson(rawContent);
        return rawContent;
      }
    }
    throw new Error('Empty or invalid response from AI model.');

  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
    const isQuota = status === 429 || message.toLowerCase().includes('quota');

    // 1. Failover: If primary key fails with quota, try secondary key immediately
    if (isQuota && !useSecondary && SECONDARY_KEY) {
      console.warn('Primary AI Quota Exceeded. Rotating to Secondary Key...');
      return generateStudyMaterial(topic, prompt, 0, true);
    }

    // 2. Exponential Backoff: Only if the current key is active and failing
    if (status === 429 && retryCount < 2) {
      const delay = Math.pow(4, retryCount) * 500;
      console.warn(`Gemini Quota Hit (${useSecondary ? 'Secondary' : 'Primary'}). Retrying in ${delay}ms...`);
      await sleep(delay);
      return generateStudyMaterial(topic, prompt, retryCount + 1, useSecondary);
    }

    // 3. Final Failure: If both failed or non-quota error
    console.error('Gemini API Error Context:', error);
    const enhancedError = new Error(isQuota 
      ? 'All AI channels are currently busy. Activating local synthetic engine.' 
      : `AI Synthesis System: ${message}`
    );
    enhancedError.isQuotaExceeded = isQuota;
    throw enhancedError;
  }
};

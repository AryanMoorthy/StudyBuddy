import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateStudyMaterial = async (type, topic) => {
  const prompts = {
    summary: `Generate a concise and structured study summary for the topic: ${topic}. Include key concepts and bullet points. Use Markdown.`,
    questions: `Generate 5 practice questions with answers for the topic: ${topic}. Return exactly and ONLY a valid JSON array of objects, with no markdown formatting and no code blocks. Each object must have "question" (string), "options" (array of exactly 4 strings), "correctAnswer" (string, exact match to one of the options), and "explanation" (string, briefly explaining why the answer is correct).`,
    flashcards: `Generate 5 flashcards for the topic: ${topic}. Return exactly and ONLY a valid JSON array of objects, with no markdown formatting and no code blocks. Each object must have "front" (Question/Term as string) and "back" (Answer/Definition as string).`
  };

  const prompt = prompts[type] || prompts.summary;

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.candidates && response.data.candidates[0].content.parts[0].text) {
      return response.data.candidates[0].content.parts[0].text;
    }
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to generate study material with Gemini');
  }
};


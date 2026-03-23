import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCWgrGIYFFmLqAHFTDb21vCJ9OdiRwoW9A';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateStudyMaterial = async (type, topic) => {
  const prompts = {
    summary: `Generate a concise and structured study summary for the topic: ${topic}. Include key concepts and bullet points. Use Markdown.`,
    questions: `Generate 5 practice questions with answers for the topic: ${topic}. Use Markdown.`,
    flashcards: `Generate 5 flashcards (Front: Question/Term, Back: Answer/Definition) for the topic: ${topic}. Use Markdown.`
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


/**
 * 🧪 Mock Intelligence Service
 * 
 * Provides high-quality, structurally valid synthetic data when the AI API 
 * is over quota or unavailable. This ensures the app's analytical features
 * (Mistake Mastery, Progress Tracking) remain functional.
 */

const SUBJECT_TEMPLATES = {
  programming: [
    {
      question: "What is the primary purpose of a 'Design Pattern' in software development?",
      options: ["To write code faster", "To provide reusable solutions to common problems", "To encrypt source code", "To automate unit testing"],
      correctAnswer: 1,
      explanation: "Design patterns are generalized, reusable solutions to commonly occurring problems within a given context in software design."
    },
    {
      question: "Which of the following is a characteristic of 'Immutable' data structures?",
      options: ["They change size dynamically", "They cannot be modified after creation", "They are stored only in cache", "They require manual memory management"],
      correctAnswer: 1,
      explanation: "Immutable objects cannot be changed once they are created, which helps prevent side effects and simplifies state management."
    }
  ],
  math: [
    {
      question: "In calculus, what does the 'Derivative' of a function represent?",
      options: ["The area under the curve", "The average value of the function", "The instantaneous rate of change", "The y-intercept of the function"],
      correctAnswer: 2,
      explanation: "The derivative of a function at a point describes the rate at which the function's value changes as its input changes."
    }
  ],
  general: [
    {
      question: "Which approach is most effective for long-term retention of [TOPIC]?",
      options: ["Cramming before an exam", "Passive reading and highlighting", "Active recall and spaced repetition", "Watching lectures at 2x speed"],
      correctAnswer: 2,
      explanation: "Active recall and spaced repetition are scientifically proven to strengthen neural pathways and improve long-term memory retrieval."
    },
    {
      question: "What is a 'First Principles' approach to understanding [TOPIC]?",
      options: ["Memorizing all definitions", "Breaking it down into fundamental truths", "Comparing it only to similar topics", "Following established best practices only"],
      correctAnswer: 1,
      explanation: "First principles thinking involves deconstructing complex problems into basic elements and then reassembling them from the ground up."
    }
  ]
};

const MOCK_SUMMARIES = {
  general: `
# Mastering [TOPIC]: Strategic Overview

Understanding **[TOPIC]** requires a balance of foundational theory and practical application. 

### Key Pillars:
1. **Core Abstraction**: Identifying the fundamental "Why" behind the logic.
2. **Structural Interconnectivity**: How [TOPIC] relates to broader domains.
3. **Execution Edge**: Best practices for implementing [TOPIC] in real-world scenarios.

> Spaced repetition of these core concepts is highly recommended for mastery.
  `
};

export const mockService = {
  /**
   * Detects the best category for a topic based on name analysis
   */
  detectCategory(topicName = '') {
    const name = topicName.toLowerCase();
    if (/script|code|python|java|programming|api|data|structure|algorithm|dev/.test(name)) return 'programming';
    if (/math|calc|equation|physics|number|geometry/.test(name)) return 'math';
    return 'general';
  },

  /**
   * Generates a structural mock summary
   */
  generateSummary(topic) {
    let template = MOCK_SUMMARIES.general;
    return template.replace(/\[TOPIC\]/g, topic);
  },

  /**
   * Generates a collection of mock flashcards
   */
  generateFlashcards(topic) {
    return [
      { front: `What is the core definition of ${topic}?`, back: `The fundamental principles and mechanics that define the logic of ${topic}.` },
      { front: `How does ${topic} benefit your daily workflow?`, back: `It provides a structured framework for solving specific problems within its domain.` },
      { front: `What is a common pitfall when studying ${topic}?`, back: `Focusing on memorization instead of first-principles understanding.` }
    ];
  },

  /**
   * Generates quiz questions based on topic and count
   */
  generateQuestions(topic, count = 5) {
    const category = this.detectCategory(topic);
    const pool = SUBJECT_TEMPLATES[category] || SUBJECT_TEMPLATES.general;
    const fallbackPool = SUBJECT_TEMPLATES.general;
    
    const questions = [];
    const usedIndices = new Set();
    
    // 1. Try to get category-specific questions
    while (questions.length < count && questions.length < pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      if (!usedIndices.has(`cat-${idx}`)) {
        questions.push({ ...pool[idx] });
        usedIndices.add(`cat-${idx}`);
      }
    }
    
    // 2. Fill the rest with general structural questions
    while (questions.length < count) {
      const idx = Math.floor(Math.random() * fallbackPool.length);
      const q = { ...fallbackPool[idx] };
      q.question = q.question.replace(/\[TOPIC\]/g, topic);
      q.explanation = q.explanation.replace(/\[TOPIC\]/g, topic);
      questions.push(q);
    }
    
    return questions.slice(0, count);
  }
};

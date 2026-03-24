import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateStudyMaterial } from '../services/aiService';
import { useSubjects } from '../hooks/useSubjects';
import { 
  MdAutoAwesome, 
  MdDescription, 
  MdQuestionAnswer, 
  MdStyle,
  MdContentCopy,
  MdAutorenew
} from 'react-icons/md';
import { toast } from 'react-toastify';

const FlashcardViewer = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  let cards = [];
  try {
    cards = typeof data === 'string' ? JSON.parse(data.replace(/```json/g, '').replace(/```/g, '').trim()) : data;
  } catch (e) {
    return <div className="ai-text"><ReactMarkdown>{data}</ReactMarkdown></div>;
  }

  if (!Array.isArray(cards) || cards.length === 0) return <p>No flashcards generated.</p>;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev + 1) % cards.length), 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length), 150);
  };

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <h4>Concept {currentIndex + 1}</h4>
            <p>{cards[currentIndex].front}</p>
            <span className="flip-hint"><MdAutorenew /> Click to flip</span>
          </div>
          <div className="flashcard-back">
            <h4>Definition</h4>
            <p>{cards[currentIndex].back}</p>
          </div>
        </div>
      </div>
      <div className="flashcard-controls">
        <button className="nav-btn" onClick={handlePrev}>Previous</button>
        <span>{currentIndex + 1} / {cards.length}</span>
        <button className="nav-btn" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

const QuizViewer = ({ data }) => {
  let questions = [];
  try {
    questions = typeof data === 'string' ? JSON.parse(data.replace(/```json/g, '').replace(/```/g, '').trim()) : data;
  } catch (e) {
    return <div className="ai-text"><ReactMarkdown>{data}</ReactMarkdown></div>;
  }

  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!Array.isArray(questions) || questions.length === 0) return <p>No questions generated.</p>;

  const handleSelect = (qIndex, option) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const score = Object.keys(answers).filter(key => answers[key] === questions[key].correctAnswer).length;

  return (
    <div className="quiz-container">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="quiz-question">
          <h4>{qIndex + 1}. {q.question}</h4>
          <div className="quiz-options">
            {q.options.map((opt, oIndex) => {
              const isSelected = answers[qIndex] === opt;
              const isCorrect = showResults && opt === q.correctAnswer;
              const isWrong = showResults && isSelected && opt !== q.correctAnswer;
              
              let className = "quiz-option";
              if (isSelected) className += " selected";
              if (isCorrect) className += " correct";
              if (isWrong) className += " wrong";

              return (
                <button 
                  key={oIndex} 
                  className={className}
                  onClick={() => handleSelect(qIndex, opt)}
                  disabled={showResults}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {showResults && q.explanation && (
            <div className="quiz-explanation">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}

      {showResults ? (
        <div className="quiz-results">
          <h4>Your Score: {score} / {questions.length}</h4>
          <button className="submit-btn" onClick={() => { setAnswers({}); setShowResults(false); }}>Retake Quiz</button>
        </div>
      ) : (
        <div className="quiz-controls">
          <button 
            className="submit-btn" 
            onClick={() => setShowResults(true)}
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit Answers
          </button>
        </div>
      )}
    </div>
  );
};

const AITools = () => {
  const { subjects, topics } = useSubjects();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [activeTool, setActiveTool] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('ai_api_key') || '');

  const tools = [
    { id: 'summary', name: 'Topic Summary', icon: <MdDescription />, desc: 'Condensed key points' },
    { id: 'questions', name: 'Practice Quiz', icon: <MdQuestionAnswer />, desc: 'Test your knowledge' },
    { id: 'flashcards', name: 'Flashcards', icon: <MdStyle />, desc: 'Spaced repetition cards' },
  ];

  const handleGenerate = async (type) => {
    if (!selectedTopic) return toast.warning('Please select a topic');

    setLoading(true);
    setResult('');
    setActiveTool(type);
    try {
      const data = await generateStudyMaterial(type, selectedTopic);
      setResult(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="ai-page">
      <header className="page-header">
        <div className="title-group">
          <MdAutoAwesome className="page-icon" />
          <div>
            <h1>AI Study Assistant</h1>
            <p>Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </header>

      <div className="ai-container">
        <div className="controls-panel">
          <div className="card tool-selector">
            <h3>Select Topic</h3>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
              <option value="">Select Topic</option>
              {topics.map(t => (
                <option key={t.id} value={t.name}>{t.name} ({subjects.find(s => s.id === t.subjectId)?.name})</option>
              ))}
            </select>

            <div className="tool-grid">
              {tools.map(tool => (
                <button 
                  key={tool.id} 
                  className="tool-btn card"
                  onClick={() => handleGenerate(tool.id)}
                  disabled={loading}
                >
                  <div className="tool-icon">{tool.icon}</div>
                  <div className="tool-info">
                    <h4>{tool.name}</h4>
                    <span>{tool.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="result-panel">
          <div className="card result-card">
            <div className="result-header">
              <h3>Generated Content</h3>
              {result && (
                <button onClick={copyToClipboard} className="icon-btn">
                  <MdContentCopy />
                </button>
              )}
            </div>
            
            <div className="result-content">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>AI is thinking...</p>
                </div>
              ) : result ? (
                activeTool === 'flashcards' ? (
                  <FlashcardViewer data={result} />
                ) : activeTool === 'questions' ? (
                  <QuizViewer data={result} />
                ) : (
                  <div className="ai-text">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                )
              ) : (
                <div className="empty-result">
                  <MdAutoAwesome size={48} />
                  <p>Select a topic and tool to begin generation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-page { display: flex; flex-direction: column; gap: 2rem; }
        .page-icon { font-size: 2.5rem; color: var(--primary); }
        .title-group { display: flex; gap: 1rem; align-items: center; }
        .api-config input { padding: 0.5rem 1rem; background: var(--glass); border: 1px solid var(--border); border-radius: 8px; color: white; width: 250px; }
        
        .ai-container { display: flex; flex-direction: column; gap: 2rem; }
        .tool-selector h3 { margin-bottom: 1rem; }
        .tool-selector select { width: 100%; padding: 0.75rem; background: var(--bg-dark); color: white; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 2rem; }
        
        .tool-grid { display: flex; flex-direction: column; gap: 1rem; }
        .tool-btn { 
          display: flex; 
          gap: 1rem; 
          align-items: center; 
          text-align: left; 
          background: var(--glass); 
          border: 1px solid var(--border);
          transition: var(--transition);
          cursor: pointer;
          padding: 1rem;
        }
        .tool-btn:hover:not(:disabled) { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
        .tool-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tool-icon { font-size: 1.5rem; color: var(--primary); }
        .tool-info h4 { margin: 0; font-size: 1rem; }
        .tool-info span { font-size: 0.8rem; color: var(--text-muted); }

        .result-card { min-height: 500px; display: flex; flex-direction: column; }
        .result-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem; }
        .result-content { flex: 1; position: relative; }
        .ai-text { font-family: inherit; font-size: 0.95rem; color: var(--text-main); line-height: 1.8; }
        .ai-text h1, .ai-text h2, .ai-text h3 { color: var(--text-main); margin: 1rem 0 0.5rem; }
        .ai-text p { margin-bottom: 0.75rem; }
        .ai-text strong { color: #a5b4fc; font-weight: 700; }
        .ai-text em { color: #f0abfc; }
        .ai-text ul, .ai-text ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .ai-text li { margin-bottom: 0.25rem; }
        .ai-text hr { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
        .ai-text code { background: rgba(99,102,241,0.15); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        .ai-text blockquote { border-left: 3px solid var(--primary); padding-left: 1rem; color: var(--text-muted); margin: 0.5rem 0; }
        .icon-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.25rem; }
        .icon-btn:hover { color: var(--primary); }
        
        .loading-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
        .spinner { width: 40px; height: 40px; border: 4px solid var(--glass); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
        .empty-result { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 1rem; }

        /* Flashcard Styles */
        .flashcard-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 500px; padding: 1rem; }
        .flashcard { width: 100%; max-width: 800px; height: 450px; perspective: 1000px; cursor: pointer; margin-bottom: 2rem; }
        .flashcard-inner { width: 100%; height: 100%; position: relative; transition: transform 0.6s; transform-style: preserve-3d; }
        .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { width: 100%; height: 100%; position: absolute; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; background: var(--bg-dark); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .flashcard-back { transform: rotateY(180deg); background: rgba(99, 102, 241, 0.1); border-color: var(--primary); }
        .flashcard h4 { color: var(--primary); margin-bottom: 1.5rem; font-size: 1.5rem; }
        .flashcard p { font-size: 1.4rem; line-height: 1.6; }
        .flip-hint { position: absolute; bottom: 1rem; font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
        .flashcard-controls { display: flex; align-items: center; gap: 2rem; }
        .nav-btn { padding: 0.5rem 1.5rem; background: var(--glass); border: 1px solid var(--border); border-radius: 8px; color: white; cursor: pointer; transition: all 0.2s; }
        .nav-btn:hover { background: var(--primary); border-color: var(--primary); }

        /* Quiz Styles */
        .quiz-container { padding: 1rem; max-width: 800px; margin: 0 auto; }
        .quiz-question { margin-bottom: 2rem; background: var(--bg-dark); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); }
        .quiz-question h4 { margin-bottom: 1rem; font-size: 1.1rem; line-height: 1.5; color: var(--text-main); }
        .quiz-options { display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-option { padding: 1rem; text-align: left; background: var(--glass); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; transition: all 0.2s; font-size: 0.95rem; }
        .quiz-option:hover:not(:disabled) { border-color: var(--primary); background: rgba(99, 102, 241, 0.1); }
        .quiz-option.selected { border-color: var(--primary); background: rgba(99, 102, 241, 0.2); }
        .quiz-option.correct { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
        .quiz-option.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
        .quiz-controls { display: flex; justify-content: flex-end; margin-top: 2rem; }
        .submit-btn { padding: 0.75rem 2rem; background: var(--primary); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .quiz-results { text-align: center; margin-top: 2rem; padding: 2rem; background: rgba(99, 102, 241, 0.1); border-radius: 12px; border: 1px solid var(--primary); }
        .quiz-results h4 { font-size: 1.5rem; color: white; margin-bottom: 1rem; }

        .quiz-explanation { margin-top: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.03); border-left: 4px solid var(--primary); border-radius: 4px; font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; animation: fadeIn 0.4s ease-out; }
        .quiz-explanation strong { color: var(--primary); margin-right: 0.5rem; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .ai-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AITools;

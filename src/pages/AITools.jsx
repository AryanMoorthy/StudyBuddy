import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateStudyMaterial } from '../services/aiService';
import { useSubjects } from '../hooks/useSubjects';
import { 
  MdAutoAwesome, 
  MdDescription, 
  MdQuestionAnswer, 
  MdStyle,
  MdContentCopy
} from 'react-icons/md';
import { toast } from 'react-toastify';

const AITools = () => {
  const { subjects, topics } = useSubjects();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
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
              <h3>Generator Results</h3>
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
                <div className="ai-text">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
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
        
        .ai-container { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
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

        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .ai-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AITools;

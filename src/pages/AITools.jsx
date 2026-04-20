import React, { useState, useContext, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStudyMaterial } from '../services/aiService';
import { StudyContext } from '../context/StudyContext';
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Zap,
  Loader2,
  X,
  Target,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  History,
  ChevronDown,
  TrendingUp,
  Flame,
  PlusCircle,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { studyService } from '../services/studyService';
import { useLearningIntelligence } from '../hooks/useLearningIntelligence';
import { mockService } from '../services/mockService';

const QuizViewer = ({ data, onRestart, onNewQuiz, onRetryIncorrect, onQuizComplete, isMistakeMode = false }) => {
  const { recordMistakeResult, removeMistakeManually, mistakes, user } = useContext(StudyContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const explanationRef = useRef(null);

  const currentQuestion = data[currentIndex];

  // Keyboard support
  useEffect(() => {
    if (quizFinished) return;
    
    const handleKeyDown = (e) => {
      if (!isAnswered) {
        if (e.key >= '1' && e.key <= '4') {
          handleSelect(parseInt(e.key) - 1);
        }
      } else if (e.key === 'Enter') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isAnswered, quizFinished]);

  // Smooth scroll to explanation
  useEffect(() => {
    if (isAnswered && explanationRef.current) {
      setTimeout(() => {
        explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isAnswered]);

  const handleSelect = async (idx) => {
    if (isAnswered) return;

    console.log("🚨 HANDLE SELECT TRIGGERED");
    console.log("Selected:", idx);
    console.log("Correct:", currentQuestion.correctAnswer);

    const isCorrect = idx === currentQuestion.correctAnswer;

    setSelectedIdx(idx);
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      console.log("❌ Wrong answer → attempting to save mistake");
      console.log("👤 User before save:", user);
    }

    // Trigger Persistence Layer (ALWAYS track attempts — await to catch errors)
    await recordMistakeResult(currentQuestion, isCorrect);

    setUserAnswers(prev => [...prev, {
      questionIdx: currentIndex,
      selectedIdx: idx,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Fire quiz completion callback with final score for topic stat tracking
      if (onQuizComplete && !isMistakeMode) {
        onQuizComplete(score + (selectedIdx === currentQuestion.correctAnswer ? 1 : 0), data.length);
      }
    }
  };

  if (quizFinished) {
    const percentage = Math.round((score / data.length) * 100);
    const wrongAnswers = userAnswers.filter(a => !a.isCorrect);
    
    const getTier = () => {
      if (percentage === 100) return { title: "Mastery Achieved", desc: "You've got a strong command of this topic.", color: "text-emerald-500" };
      if (percentage >= 75) return { title: "Great Work", desc: "You're almost there—just a few gaps.", color: "text-blue-500" };
      if (percentage >= 50) return { title: "Good Effort", desc: "Solid foundation, but worth another pass.", color: "text-amber-500" };
      return { title: "Keep Practicing", desc: "Review the explanations and try again.", color: "text-rose-500" };
    };

    const tier = getTier();

    return (
      <div className="p-8 lg:p-12 animate-fade-in space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter text-foreground">{score} <span className="text-muted-foreground text-3xl">/ {data.length}</span></h2>
            <div className={`text-xl font-black uppercase tracking-widest ${tier.color}`}>{tier.title}</div>
            <p className="text-muted-foreground font-medium">{tier.desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={onRestart} className="p-6 rounded-3xl bg-card border border-border hover:border-primary transition-all flex flex-col items-center gap-3 group">
            <RotateCcw className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs font-black uppercase tracking-widest">Restart Quiz</span>
          </button>
          
          {wrongAnswers.length > 0 ? (
            <button onClick={() => onRetryIncorrect(wrongAnswers.map(a => data[a.questionIdx]))} className="p-6 rounded-3xl bg-primary/5 border border-primary/20 hover:border-primary transition-all flex flex-col items-center gap-3 group">
              <History className="w-6 h-6 text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">Retry Incorrect</span>
            </button>
          ) : (
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center gap-3 opacity-50 grayscale cursor-not-allowed">
              <Check className="w-6 h-6 text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500">All Mastered</span>
            </div>
          )}

          <button onClick={onNewQuiz} className="p-6 rounded-3xl bg-foreground text-background transition-all flex flex-col items-center gap-3 group hover:scale-[1.02]">
            <Sparkles className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">New Topic Quiz</span>
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-1">Detailed Analysis</h3>
          <div className="space-y-4">
            {data.map((q, i) => {
              const userAns = userAnswers.find(a => a.questionIdx === i);
              const qHash = studyService.generateQuestionHash(q.question, q.options);
              const mistakeRecord = mistakes.find(m => m.question_hash === qHash);
              
              const isFrequentlyMissed = mistakeRecord && (mistakeRecord.times_wrong - mistakeRecord.times_correct) >= 2;
              const isImproving = mistakeRecord && mistakeRecord.times_correct > 0;

              return (
                <details key={i} className="group border border-border rounded-3xl bg-card overflow-hidden" open={!userAns?.isCorrect}>
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/30 transition-colors list-none">
                    <div className="flex items-center gap-4">
                      {userAns?.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-foreground leading-tight truncate max-w-md md:max-w-xl">{q.question}</span>
                        <div className="flex gap-2">
                           {!userAns?.isCorrect && <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">Saved for Practice</span>}
                           {isFrequentlyMissed && <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20"><Flame className="w-2 h-2" /> Frequently Missed</span>}
                           {isImproving && !isFrequentlyMissed && <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20"><TrendingUp className="w-2 h-2" /> Improving</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 pt-2 space-y-4 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className={`p-4 rounded-2xl text-xs font-bold border-2 
                          ${optIdx === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 
                            optIdx === userAns?.selectedIdx ? 'bg-rose-500/10 border-rose-500 text-rose-600' :
                            'bg-muted/30 border-transparent text-muted-foreground grayscale opacity-60'}
                        `}>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="p-5 bg-muted/50 rounded-2xl border border-border/50 flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Explanatory Note</p>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{q.explanation}</p>
                      </div>
                      {mistakeRecord && (
                        <div className="flex items-end">
                           <button 
                             onClick={() => removeMistakeManually(mistakeRecord.id)}
                             className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-colors py-2"
                           >
                             Remove from Practice
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-foreground h-full relative">
       <div className="p-8 lg:p-12 overflow-y-auto">
          <div className="space-y-10">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary px-4 py-1.5 bg-primary/10 rounded-full">
                    {isMistakeMode ? "Mistake Mastery" : "Unit"} {currentIndex + 1} of {data.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{percentageDone(currentIndex + 1, data.length)}%</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex + 1) / data.length * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                {isMistakeMode && (
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                      <History className="w-3 h-3" /> Practicing your weak areas
                   </div>
                )}
                <h3 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter leading-tight mt-6">{currentQuestion.question}</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, i) => {
                  const isCorrect = i === currentQuestion.correctAnswer;
                  const isSelected = selectedIdx === i;
                  
                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleSelect(i)}
                      className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left font-bold text-lg h-full
                        ${isAnswered && isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 
                          isAnswered && isSelected && !isCorrect ? 'bg-rose-500/10 border-rose-500 text-rose-600' :
                          !isAnswered && isSelected ? 'bg-primary/10 border-primary text-primary shadow-premium' :
                          isAnswered ? 'bg-muted/10 border-border/50 text-muted-foreground/40' :
                          'bg-card border-border hover:border-primary/30 text-foreground'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-colors shadow-soft
                          ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}
                        `}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-base md:text-lg">{opt}</span>
                      </div>
                    </button>
                  );
                })}
             </div>

             <div className="min-h-[120px] relative transition-all duration-500">
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div 
                      ref={explanationRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        {selectedIdx === currentQuestion.correctAnswer ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedIdx === currentQuestion.correctAnswer ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {selectedIdx === currentQuestion.correctAnswer ? 'Logic Verified' : 'Logic Flaw Detected'}
                        </span>
                      </div>

                      {/* Mastery Progress Indicator */}
                      {(() => {
                        const qHash = studyService.generateQuestionHash(currentQuestion.question, currentQuestion.options);
                        const mistakeRecord = mistakes.find(m => m.question_hash === qHash);
                        const isCorrect = selectedIdx === currentQuestion.correctAnswer;

                        if (!isCorrect) {
                          // Wrong answer — show progress toward mastery
                          const timesCorrect = mistakeRecord?.times_correct ?? 0;
                          const needed = 2 - timesCorrect;
                          return (
                            <div className="flex items-center gap-3 px-4 py-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                              <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1.5">
                                  Saved for Practice — Mastery Progress
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[0, 1].map(i => (
                                      <div key={i} className={`w-6 h-1.5 rounded-full transition-all ${i < timesCorrect ? 'bg-emerald-500' : 'bg-rose-500/30'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground">
                                    {timesCorrect}/2 correct — get it right {needed} more time{needed !== 1 ? 's' : ''} to remove
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        } else if (mistakeRecord) {
                          // Got it right AND had a prior mistake record
                          const timesCorrect = mistakeRecord?.times_correct ?? 1;
                          const isMastered = timesCorrect >= 2;
                          return (
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isMastered ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/5 border-blue-500/20'}`}>
                              {isMastered ? <Trophy className="w-4 h-4 text-emerald-500 shrink-0" /> : <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />}
                              <div className="flex-1">
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isMastered ? 'text-emerald-500' : 'text-blue-500'}`}>
                                  {isMastered ? '🎉 Mastered! Removed from Practice' : 'Getting Stronger!'}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[0, 1].map(i => (
                                      <div key={i} className={`w-6 h-1.5 rounded-full transition-all ${i < timesCorrect ? 'bg-emerald-500' : 'bg-muted'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground">
                                    {isMastered ? 'Question retired from your practice queue' : `${timesCorrect}/2 — one more correct answer to master this`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="p-6 rounded-3xl bg-muted border border-border space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Explanation</p>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{currentQuestion.explanation || "No explanation provided for this synthetic response."}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
       </div>

       <div className="bg-muted/20 p-8 border-t border-border flex items-center justify-between rounded-b-[2rem]">
          <div className="flex items-center gap-3">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {isAnswered ? "Review complete. Proceed." : "Choose one parameter to continue."}
             </p>
          </div>
          <button 
            disabled={!isAnswered}
            onClick={handleNext}
            className="px-10 py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs shadow-soft hover:shadow-xl transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {currentIndex === data.length - 1 ? 'Finish Assessment' : 'Next Question'} <ArrowRight className="w-4 h-4" />
          </button>
       </div>
    </div>
  );
};

const percentageDone = (curr, total) => Math.round((curr / total) * 100);

const FlashcardViewer = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center text-foreground">
      <div className="w-full flex items-center justify-center py-12 lg:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full h-[400px] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-full h-full text-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 backface-hidden bg-card border border-border shadow-card rounded-[3rem] flex flex-col items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary mb-8 px-4 py-1.5 bg-primary/10 rounded-full">Question</span>
                <h3 className="text-3xl font-black text-foreground tracking-tight leading-tight">{data[currentIndex].front}</h3>
                <p className="mt-8 text-muted-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Click to flip
                </p>
              </div>
              <div className="absolute inset-0 backface-hidden bg-primary rounded-[3rem] shadow-premium flex flex-col items-center justify-center p-12 text-primary-foreground" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary-foreground/60 mb-8 px-4 py-1.5 bg-white/20 rounded-full">Resolution</span>
                <h3 className="text-3xl font-black tracking-tight leading-tight">{data[currentIndex].back}</h3>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full bg-muted/20 p-8 flex items-center justify-between border-t border-border rounded-b-[2rem]">
        <button onClick={() => { setCurrentIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }} className="p-4 rounded-full bg-card border border-border hover:bg-muted transition-all disabled:opacity-30 shadow-soft" disabled={currentIndex === 0}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Flashcard Progress</p>
            <div className="flex items-center gap-2">
               {data.map((_, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-primary' : 'bg-muted-foreground/20'}`} />
               ))}
            </div>
        </div>
        <button onClick={() => { setCurrentIndex(prev => Math.min(data.length - 1, prev + 1)); setIsFlipped(false); }} className="p-4 rounded-full bg-card border border-border hover:bg-muted transition-all disabled:opacity-30 shadow-soft" disabled={currentIndex === data.length - 1}>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const AITools = () => {
  const { subjects, topics, mistakes, userTopicStats, submitIntelligenceFeedback, refreshData, recordQuizResult } = useContext(StudyContext);
  const { profile: intelligenceProfile } = useLearningIntelligence();
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [activeTool, setActiveTool] = useState('summary');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState('Analyzing Topic Logic...');
  const [result, setResult] = useState(null);
  const [quizKey, setQuizKey] = useState(0);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const tools = [
    { id: 'summary', title: 'Topic Summary', desc: 'Condensed key insights', icon: FileText, prompt: 'Create a concise, structured markdown summary of this topic for a 5-minute review.' },
    { id: 'flashcards', title: 'Smart Cards', desc: 'Active recall study', icon: Zap, prompt: 'Generate 5 high-quality flashcards as a JSON array. Each object MUST have "front" (the question/term) and "back" (the answer/definition).' },
    { id: 'questions', title: 'Practice Quiz', desc: 'Test your understanding', icon: MessageSquare, prompt: `Generate exactly {COUNT} multiple choice questions. Return ONLY valid JSON as an array. Each object must follow this schema: { "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": number (0-3), "explanation": "clear explanation of why the correct answer is correct" }. Do not include any text outside the JSON.` },
    { id: 'mistake_mastery', title: 'Mistake Mastery', desc: 'Conquer your weak areas', icon: History, prompt: 'Practicing your weak areas based on past quiz attempts.' },
  ];

  // Dynamic loading messages
  useEffect(() => {
    if (!loading) return;
    const messages = ["Generating questions...", "Analyzing topic...", "Drafting explanations...", "Finalizing logic..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadMessage(messages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (countOverride = null) => {
    try {
      if (activeTool === 'mistake_mastery') {
         if (mistakes.length === 0) return toast.info("No mistakes to practice. Great work!");
         // Map Supabase snake_case → QuizViewer camelCase
         const mapped = mistakes.map(m => ({
           ...m,
           correctAnswer: parseInt(m.correct_answer ?? m.correctAnswer, 10),
           options: Array.isArray(m.options) ? m.options : JSON.parse(m.options || '[]'),
           userAnswer: m.user_answer ?? m.userAnswer,
         }));
         setResult(mapped);
         setIsSimulationMode(false);
         return;
      }

      if (!selectedTopicId) return toast.error('Please select an area of focus');
      setLoading(true);
      setResult(null);
      const selectedTopic = topics.find(t => t.id === selectedTopicId);
      const tool = tools.find(t => t.id === activeTool);
      const finalCount = countOverride || questionCount;

      // 1. Simulation Path (Direct to Mock)
      if (isSimulationMode) {
        setLoadMessage('Initializing Synthetic Engine...');
        await new Promise(r => setTimeout(r, 1000));
        
        let mockData;
        if (activeTool === 'summary') mockData = mockService.generateSummary(selectedTopic.name);
        if (activeTool === 'flashcards') mockData = mockService.generateFlashcards(selectedTopic.name);
        if (activeTool === 'questions') mockData = mockService.generateQuestions(selectedTopic.name, finalCount);
        
        setResult(mockData);
        toast.info('Synthesizing using Local Logic Engine');
        return;
      }
      
      // 2. Intelligence Path (Gemini)
      const weakTopics = intelligenceProfile?.weakTopics || [];
      const strongTopics = intelligenceProfile?.strongTopics || [];
      const avgAccuracy = intelligenceProfile?.avgAccuracy ?? 'N/A';
      
      let basePrompt = tool.id === 'questions' 
        ? tool.prompt.replace('{COUNT}', finalCount)
        : tool.prompt;

      const enrichedPrompt = `
        User Intelligence Profile:
        - Weak Topics (Needs Focus): ${weakTopics.length ? weakTopics.join(', ') : 'None yet'}
        - Strong Topics (Avoid Over-testing): ${strongTopics.length ? strongTopics.join(', ') : 'None yet'}
        - Global Accuracy: ${avgAccuracy}

        Current Target Topic: ${selectedTopic.name}
        
        Task: ${basePrompt}
        
        Strict Instructions:
        1. Focus conceptual difficulty heavily on weak areas if related.
        2. Dynamically adjust reading level based on their Global Accuracy.
        3. Return ONLY the requested format format without conversational filler.
      `;

      try {
        const data = await generateStudyMaterial(selectedTopic.name, enrichedPrompt);
        
        if (tool.id === 'questions') {
          if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid quiz format received.");
          if (data.some(q => !q.options || q.options.length !== 4)) throw new Error("Incomplete question data detected.");
        }
        
        setResult(data);
        setIsSimulationMode(false);
        toast.success('Strategy Augmented Successfully!');
      } catch (err) {
        toast.error(err.message || 'AI synthesis failed. Your credits may be low or the service is temporarily busy.');
        // Automatic fallback to Simulation Mode removed as per user request.
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 md:px-10 lg:px-12 space-y-8 animate-fade-in text-foreground pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">Intelligence Portal</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Augment your study process with synthetic logic.</p>
        </div>
          <div className={`flex items-center gap-3 px-6 py-3 border rounded-2xl shadow-soft transition-all duration-500
            ${isSimulationMode ? 'bg-amber-500/5 border-amber-500/20 text-amber-600' : 'bg-primary/5 border-primary/20 text-primary'}`}>
            {isSimulationMode ? <Zap className="w-5 h-5 fill-amber-500" /> : <Sparkles className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-widest">
              {isSimulationMode ? 'Synthetic Logic Active' : 'Gemini 2.5 Flash Enabled'}
            </span>
            {isSimulationMode && (
               <button onClick={() => setIsSimulationMode(false)} className="ml-2 hover:bg-amber-500/10 p-1 rounded-md transition-colors">
                  <RotateCcw className="w-3 h-3" />
               </button>
            )}
          </div>
      </header>

      {/* 1. System Parameters Card */}
      <section className="card-premium p-8 bg-card border border-border shadow-sm">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">Step 1: Define Target Logic</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 px-1">
              <Target className="w-3.5 h-3.5" /> Target Topic
            </label>
            <select 
              disabled={activeTool === 'mistake_mastery'}
              className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary shadow-soft transition-all cursor-pointer disabled:opacity-40" 
              value={selectedTopicId} 
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              <option value="" disabled hidden>{activeTool === 'mistake_mastery' ? 'Global Mistakes Selected' : 'Select an area of focus...'}</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>[{subjects.find(s => s.id === t.subject_id)?.name}] {t.name}</option>
              ))}
            </select>
          </div>

          {(activeTool === 'questions' || activeTool === 'mistake_mastery') && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 px-1">
                {activeTool === 'mistake_mastery' ? <TrendingUp className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
                {activeTool === 'mistake_mastery' ? 'Review Priority' : 'Quiz Depth (Questions)'}
              </label>
              {activeTool === 'mistake_mastery' ? (
                <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-xs font-black uppercase text-primary">Active Mistakes: {mistakes.length}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1">Sorted by Difficulty Algorithm</span>
                   </div>
                   <History className="w-5 h-5 text-primary opacity-40" />
                </div>
              ) : (
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(cnt => (
                    <button 
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-4 px-4 rounded-2xl font-black text-xs transition-all border
                        ${questionCount === cnt ? 'bg-primary text-white border-primary shadow-premium' : 'bg-muted/20 border-border text-muted-foreground hover:bg-muted'}
                      `}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Strategy Selection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Step 2: Choose Growth Strategy</h3>
          <Zap className="w-4 h-4 text-primary animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const isMistakeTool = tool.id === 'mistake_mastery';
            const count = isMistakeTool ? mistakes.length : null;

            return (
              <button 
                key={tool.id} 
                onClick={() => {
                  setActiveTool(tool.id);
                  setResult(null);
                }} 
                className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 text-left group relative overflow-hidden
                  ${activeTool === tool.id 
                    ? 'bg-primary/5 border-primary shadow-md ring-1 ring-primary/20' 
                    : 'bg-card border-border hover:bg-muted/50 hover:border-primary/20 shadow-sm'}
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-soft 
                  ${activeTool === tool.id ? 'bg-primary text-primary-foreground shadow-premium' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}
                `}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className={`font-black text-sm uppercase tracking-tight transition-colors ${activeTool === tool.id ? 'text-primary' : 'text-foreground'}`}>{tool.title}</h4>
                    {isMistakeTool && count > 0 && <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">{count}</span>}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-widest leading-relaxed mt-1">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Action Trigger */}
      <section className="flex justify-start pt-4">
        {activeTool === 'mistake_mastery' && mistakes.length === 0 ? (
           <div className="w-full flex flex-col items-center justify-center p-20 bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-premium">
                 <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-[0.2em] text-emerald-600">🎉 Mastery Achieved!</h3>
                <p className="text-emerald-600/60 font-bold text-xs uppercase tracking-widest mt-2 px-10">You're all caught up. No mistakes currently detected in your curriculum profile.</p>
              </div>
           </div>
        ) : (
          <button 
            onClick={() => handleGenerate()} 
            disabled={loading} 
            className="w-full md:w-auto min-w-[320px] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs py-6 px-12 rounded-[2rem] shadow-premium hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : activeTool === 'mistake_mastery' ? <Zap className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            <span>{loading ? 'Synthesizing...' : activeTool === 'mistake_mastery' ? 'Begin Mastery Drill' : 'Ignite Intelligent Generation'}</span>
          </button>
        )}
      </section>

      {/* 4. AI Output Focal Point */}
      <section className="pt-4">
        <div className="card-premium w-full min-h-[500px] bg-card relative overflow-hidden flex flex-col shadow-lg border border-border">
          <div className="absolute top-0 left-0 w-full h-1 bg-muted/50">
            {loading && <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/3 bg-primary shadow-[0_0_15px_rgba(139,92,246,0.6)]" />}
          </div>

          <div className="flex-1 overflow-y-auto">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 min-h-[500px]">
                   <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center animate-pulse mb-8 border border-primary/10 shadow-premium">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                   </div>
                   <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none mb-4">{loadMessage}</h3>
                   <p className="text-muted-foreground font-medium text-lg max-w-sm">Crafting high-fidelity logic structures with Gemini 2.5 Flash.</p>
                </div>
             ) : result ? (
                <div className="h-full animate-fade-in">
                   <AnimatePresence mode="wait">
                      <motion.div key={activeTool} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
                         {activeTool === 'flashcards' ? (
                           <FlashcardViewer data={result} />
                         ) : (activeTool === 'questions' || activeTool === 'mistake_mastery') ? (
                           <QuizViewer 
                            key={quizKey}
                            data={result} 
                            isMistakeMode={activeTool === 'mistake_mastery'}
                            onQuizComplete={(correct, total) => recordQuizResult(selectedTopicId, correct, total)}
                            onRestart={() => { setQuizKey(k => k + 1); }}
                            onNewQuiz={() => { 
                              setResult(null); 
                              setQuizKey(k => k + 1);
                              refreshData();
                            }}
                            onRetryIncorrect={(incorrectQuestions) => { setResult(incorrectQuestions); setQuizKey(k => k + 1); }}
                           />
                         ) : (
                           <div className="p-10 lg:p-16 prose prose-slate dark:prose-invert max-w-none 
                             prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:text-foreground
                             prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg
                             prose-strong:text-foreground prose-strong:font-black
                             prose-code:bg-primary/5 prose-code:text-primary prose-code:rounded-md prose-code:px-2 prose-code:py-1
                           ">
                             <ReactMarkdown>{result}</ReactMarkdown>
                           </div>
                         )}
                      </motion.div>
                   </AnimatePresence>
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 grayscale opacity-40 min-h-[500px]">
                   <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mb-8 shadow-soft">
                      <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xl font-black uppercase tracking-[0.2em] text-foreground">Awaiting Input Parameters</h3>
                      <p className="max-w-[320px] font-medium text-muted-foreground text-sm">Designate a focus area and objective strategy above to initialize the portal.</p>
                   </div>
                </div>
             )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AITools;

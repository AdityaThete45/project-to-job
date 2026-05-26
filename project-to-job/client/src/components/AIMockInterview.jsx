import React, { useState, useEffect } from "react";
import { gradeInterview } from "../services/api";
import { Sparkles, Calendar, Target, Play, Award, CheckCircle, Volume2, Mic, MicOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_QUESTIONS = {
  frontend: [
    "Explain the difference between virtual DOM and real DOM in React.",
    "What is closure in JavaScript, and what are its practical use cases?",
    "How do you optimize a webpage's loading performance?"
  ],
  backend: [
    "What is the difference between SQL and NoSQL databases? When would you use MongoDB?",
    "Explain how JSON Web Token (JWT) authentication works in a REST API.",
    "How would you design a rate limiter middleware for an Express server?"
  ],
  hr: [
    "Tell me about a challenging technical bug you faced and how you resolved it.",
    "Why do you want to join our startup instead of a large multinational enterprise?",
    "How do you handle disagreement with a peer developer regarding project architecture?"
  ]
};

export default function AIMockInterview() {
  const [role, setRole] = useState("frontend");
  const [stage, setStage] = useState("setup"); // setup | questioning | finished | evaluating | graded
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Trigger TTS voice when question changes
  useEffect(() => {
    if (stage === "questioning") {
      speakQuestion(MOCK_QUESTIONS[role][currentIdx]);
    }
  }, [stage, currentIdx, role]);

  const speakQuestion = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any current speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMicListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      // If already listening, we let it stop naturally or trigger speech recognition abort
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCurrentAnswer(prev => prev ? prev + " " + transcript : transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const startInterview = () => {
    setStage("questioning");
    setCurrentIdx(0);
    setAnswers([]);
    setCurrentAnswer("");
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop speaking when moving on
    }

    const currentQuestion = MOCK_QUESTIONS[role][currentIdx];
    const newAnswers = [...answers, { question: currentQuestion, answer: currentAnswer }];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentIdx + 1 < MOCK_QUESTIONS[role].length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStage("finished");
    }
  };

  const handleSubmitInterview = async () => {
    setError(null);
    setStage("evaluating");
    setLoading(true);
    try {
      const data = await gradeInterview(role, `Mock ${role} Interview`, answers);
      setResult(data);
      setStage("graded");
    } catch (err) {
      console.error(err);
      setError("Failed to grade interview. Please retry.");
      setStage("finished");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl w-full text-[var(--text-primary)] min-h-[480px] flex flex-col relative">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-450 dark:text-indigo-400">
          <Calendar size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            AI Voice-Enabled Simulator
            <span className="text-[10px] bg-indigo-500/20 text-indigo-750 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-normal">Speech APIs</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">AI speaks questions aloud. Answer with voice or keyboard.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP STAGE */}
        {stage === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex flex-col justify-center text-center space-y-6 max-w-md mx-auto"
          >
            <div>
              <h4 className="text-md font-bold text-[var(--text-primary)]">Choose Your Interview Focus</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">The interviewer will speak each question. Speak your response when ready.</p>
            </div>

            <div className="flex gap-2">
              {[
                { id: "frontend", label: "Frontend Dev" },
                { id: "backend", label: "Backend Dev" },
                { id: "hr", label: "HR / Behavioral" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRole(opt.id)}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    role === opt.id
                      ? "bg-indigo-650 text-white border-indigo-600"
                      : "bg-[var(--border-light)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={startInterview}
              className="py-3.5 bg-gradient-to-r from-indigo-650 to-indigo-650 hover:from-indigo-550 hover:to-indigo-550 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play size={15} />
              <span>Begin Voice Panel</span>
            </button>
          </motion.div>
        )}

        {/* QUESTIONING STAGE */}
        {stage === "questioning" && (
          <motion.div
            key="questioning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col space-y-5"
          >
            <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] border-b border-[var(--border)] pb-3">
              <span className="font-semibold uppercase tracking-wider text-indigo-550 dark:text-indigo-400">
                {role.toUpperCase()} PANEL
              </span>
              <span>
                Question {currentIdx + 1} of {MOCK_QUESTIONS[role].length}
              </span>
            </div>

            <div className="space-y-3 bg-[var(--border-light)] p-4 rounded-xl border border-[var(--border)] flex items-start gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-[var(--text-primary)] leading-snug">
                  {MOCK_QUESTIONS[role][currentIdx]}
                </h4>
              </div>
              <button
                onClick={() => speakQuestion(MOCK_QUESTIONS[role][currentIdx])}
                title="Speak question again"
                className="p-2.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border-light)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="flex-1 flex flex-col relative">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={isListening ? "Listening... Speak your answer now." : "Type your answer or click the microphone to dictate..."}
                className={`flex-1 min-h-[160px] bg-[var(--border-light)] border rounded-xl p-4 text-sm focus:outline-none text-[var(--text-primary)] resize-none leading-relaxed transition-colors ${
                  isListening ? "border-red-500/40 focus:border-red-500/50 bg-red-500/5" : "border-[var(--border)] focus:border-indigo-500"
                }`}
              />
              
              {/* Mic buttons overlay */}
              <button
                onClick={handleMicListen}
                className={`absolute bottom-3 right-3 p-3 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleNextQuestion}
                disabled={!currentAnswer.trim()}
                className="py-3 px-6 bg-indigo-650 hover:bg-indigo-550 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                {currentIdx + 1 === MOCK_QUESTIONS[role].length ? "Complete Responses" : "Next Question →"}
              </button>
            </div>
          </motion.div>
        )}
        {/* FINISHED STAGE */}
        {stage === "finished" && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center text-center space-y-5 max-w-sm mx-auto"
          >
            <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mx-auto">
              <CheckCircle size={32} />
            </div>
            <div>
              <h4 className="text-md font-bold text-[var(--text-primary)]">Voice Responses Saved!</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Your voice answers are captured. Let's send them to the grading engine for evaluation.
              </p>
            </div>

            {error && <p className="text-rose-400 text-xs">{error}</p>}

            <button
              onClick={handleSubmitInterview}
              className="py-3 bg-gradient-to-r from-indigo-650 to-indigo-650 hover:from-indigo-550 hover:to-indigo-550 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={15} />
              <span>Evaluate Voice Interview</span>
            </button>
          </motion.div>
        )}

        {/* EVALUATING STAGE */}
        {stage === "evaluating" && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
          >
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Running AI Evaluation Suite...</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Analyzing voice transcripts, logical depth, and terminology.</p>
            </div>
          </motion.div>
        )}

        {/* GRADED STAGE */}
        {stage === "graded" && result && (
          <motion.div
            key="graded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 space-y-6"
          >
            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[var(--border)] pb-5">
              <div className="bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-4 text-center">
                <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">Score</div>
                <div className="text-2xl font-black text-indigo-555 dark:text-indigo-400 flex items-center justify-center gap-1">
                  <Award size={20} />
                  <span>{result.score}/100</span>
                </div>
              </div>
              <div className="bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-4 text-center">
                <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">Technical Fit</div>
                <div className="text-sm font-bold text-[var(--text-primary)] truncate">{result.technicalRating}</div>
              </div>
              <div className="bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-4 text-center">
                <div className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">Communication</div>
                <div className="text-sm font-bold text-[var(--text-primary)] truncate">{result.communicationRating}</div>
              </div>
            </div>

            {/* Critique Feedback */}
            <div className="bg-[var(--border-light)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-center gap-1.5 mb-2.5 text-[var(--text-primary)]">
                <Target size={15} className="text-indigo-555 dark:text-indigo-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">Constructive Feedback</h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {result.constructiveFeedback}
              </p>
            </div>

            {/* Suggested Sample Answers */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-1">
                AI Suggested Talking Points
              </h4>
              <div className="space-y-2">
                {result.suggestedAnswers?.map((ans, idx) => (
                  <div key={idx} className="bg-[var(--border-light)] border border-[var(--border)] p-4 rounded-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                    {ans}
                  </div>
                ))}
              </div>
            </div>

            {/* API Key Warning Fallback Note */}
            {result.score === 82 && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs p-3.5 rounded-xl">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <p>
                  <strong>Note:</strong> You received a default mock score of 82. Add your <code>GEMINI_API_KEY</code> inside the backend <code>.env</code> file to enable actual dynamic grading using the LLM.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStage("setup")}
                className="py-2.5 px-5 bg-[var(--border-light)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Restart Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

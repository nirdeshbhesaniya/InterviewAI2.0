import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { roadmapService } from '../../../services/roadmapService';

const AssessmentModal = ({ isOpen, onClose, moduleTitle, topics, onClear }) => {
  const [step, setStep] = useState('disclaimer'); // disclaimer, loading, test, evaluating, result
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('disclaimer');
      setQuestions([]);
      setUserAnswers([]);
      setCurrentQuestionIndex(0);
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartTest = async () => {
    setStep('loading');
    try {
      const data = await roadmapService.generateAssessment(moduleTitle, topics);
      setQuestions(data.questions || []);
      setUserAnswers(new Array(data.questions?.length || 10).fill(null));
      setStep('test');
    } catch (error) {
      console.error(error);
      setResult({ error: 'Failed to generate assessment test. Please try again later.' });
      setStep('result');
    }
  };

  const handleAnswerSelect = (option) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    setStep('evaluating');
    try {
      const data = await roadmapService.evaluateAssessment(questions, userAnswers);
      setResult(data);
      if (data.passed) {
        onClear(); // Call the parent to mark the module as cleared
      }
      setStep('result');
    } catch (error) {
      console.error(error);
      setResult({ error: 'Failed to evaluate assessment. Please try again later.' });
      setStep('result');
    }
  };

  const allAnswered = userAnswers.length > 0 && userAnswers.every(ans => ans !== null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[rgb(var(--bg-elevated))] border border-[rgb(var(--border))] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
      >
        <button
          onClick={onClose}
          disabled={step === 'loading' || step === 'evaluating'}
          className="absolute top-4 right-4 p-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-body))] rounded-xl transition-all disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Disclaimer */}
            {step === 'disclaimer' && (
              <motion.div
                key="disclaimer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-4">
                  Assessment Test
                </h2>
                <p className="text-[rgb(var(--text-secondary))] mb-6 leading-relaxed">
                  You have learned all topics in <strong>{moduleTitle}</strong>. However, this module is not considered complete until you pass this assessment test with at least <strong>75%</strong>.
                </p>
                <div className="bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] p-4 rounded-xl text-left mb-8 space-y-3">
                  <p className="flex items-center gap-2 text-sm text-[rgb(var(--text-primary))]">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> This test is AI-generated based on the module's topics.
                  </p>
                  <p className="flex items-center gap-2 text-sm text-[rgb(var(--text-primary))]">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> There will be 10 multiple-choice questions.
                  </p>
                  <p className="flex items-center gap-2 text-sm text-[rgb(var(--text-primary))]">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Test history is <strong>not stored</strong>. Results are shown only once.
                  </p>
                  <p className="flex items-center gap-2 text-sm text-orange-400">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> If you fail, you will need to retake a newly generated test.
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] font-medium transition-colors"
                  >
                    Not Yet
                  </button>
                  <button
                    onClick={handleStartTest}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Start Test Now
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Loading Generation */}
            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">Generating Test...</h3>
                <p className="text-[rgb(var(--text-muted))]">AI is crafting 10 questions for {moduleTitle}</p>
              </motion.div>
            )}

            {/* STEP 3: Test Questions */}
            {step === 'test' && questions.length > 0 && (
              <motion.div
                key="test"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-blue-500" />
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h3>
                  <span className="text-sm font-medium px-3 py-1 bg-[rgb(var(--bg-body))] rounded-full border border-[rgb(var(--border))]">
                    {Math.round(((userAnswers.filter(a => a !== null).length) / questions.length) * 100)}% Answered
                  </span>
                </div>

                <div className="mb-8">
                  <p className="text-[rgb(var(--text-primary))] text-lg leading-relaxed mb-6 font-medium">
                    {questions[currentQuestionIndex].question}
                  </p>
                  <div className="space-y-3">
                    {questions[currentQuestionIndex].options.map((option, idx) => {
                      const isSelected = userAnswers[currentQuestionIndex] === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                            isSelected 
                              ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' 
                              : 'bg-[rgb(var(--bg-body))] border-[rgb(var(--border))] text-[rgb(var(--text-primary))] hover:border-[rgb(var(--text-muted))]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-blue-500' : 'border-[rgb(var(--text-muted))]'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                          </div>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-[rgb(var(--border))]">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-5 py-2 rounded-xl text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] disabled:opacity-30 transition-all hover:bg-[rgb(var(--bg-elevated))]"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 rounded-xl bg-[rgb(var(--accent))] text-white font-medium hover:bg-[rgb(var(--accent))]/90 transition-all"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitTest}
                      disabled={!allAnswered}
                      className={`px-5 py-2 rounded-xl font-medium transition-all ${
                        allAnswered 
                          ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25' 
                          : 'bg-green-500/50 text-white/50 cursor-not-allowed'
                      }`}
                    >
                      Submit Test
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Evaluating */}
            {step === 'evaluating' && (
              <motion.div
                key="evaluating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">Evaluating Answers...</h3>
                <p className="text-[rgb(var(--text-muted))]">AI is reviewing your performance</p>
              </motion.div>
            )}

            {/* STEP 5: Result */}
            {step === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                {result.error ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-4">Error</h2>
                    <p className="text-[rgb(var(--text-secondary))] mb-8">{result.error}</p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/25 transition-all"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative ${
                      result.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {result.passed ? (
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                      ) : (
                        <XCircle className="w-12 h-12 text-red-500" />
                      )}
                      
                      {/* Score Badge */}
                      <div className={`absolute -right-2 -bottom-2 px-3 py-1 rounded-full text-white font-bold shadow-lg ${
                        result.passed ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {result.score}%
                      </div>
                    </div>

                    <h2 className={`text-3xl font-black mb-2 ${
                      result.passed ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {result.passed ? 'Module Mastered!' : 'Keep Learning'}
                    </h2>

                    <p className="text-lg text-[rgb(var(--text-primary))] mb-6">
                      You scored <strong>{result.score}%</strong> (Minimum passing score: 75%)
                    </p>

                    <div className="bg-[rgb(var(--bg-body))] border border-[rgb(var(--border))] p-6 rounded-xl text-center mb-8">
                      <p className="text-[rgb(var(--text-secondary))] italic leading-relaxed">
                        "{result.feedback}"
                      </p>
                    </div>

                    <button
                      onClick={onClose}
                      className={`px-8 py-3 rounded-xl text-white font-bold transition-all ${
                        result.passed 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25'
                      }`}
                    >
                      {result.passed ? 'Continue Roadmap' : 'Back to Module'}
                    </button>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AssessmentModal;

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useGamification, XP_VALUES } from '../../hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trophy, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface QuizData {
  id: string;
  topic: string;
  questions_json: Question[];
}

export const QuizWidget: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const { awardXp } = useGamification();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    fetchRandomQuiz();
  }, []);

  const fetchRandomQuiz = async () => {
    setLoading(true);
    setAnswered(false);
    setSelectedOption(null);
    
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .limit(5);

    if (!error && data && data.length > 0) {
      const randomQuiz = data[Math.floor(Math.random() * data.length)];
      setQuiz(randomQuiz);
      
      // Pick a random question from the questions_json array
      const questions = randomQuiz.questions_json;
      if (Array.isArray(questions) && questions.length > 0) {
        setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
      }
    }
    setLoading(false);
  };

  const handleAnswer = async (index: number) => {
    if (answered || !currentQuestion || !user || !quiz) return;

    setSelectedOption(index);
    setAnswered(true);

    const correct = index === currentQuestion.correct;
    setIsCorrect(correct);

    // Record attempt
    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      quiz_id: quiz.id,
      is_correct: correct
    });

    if (correct) {
      const xp = XP_VALUES.QUIZ_PASS;
      await awardXp(xp, `Completed ${quiz.topic} quiz correctly`);
      addToast(`Correct! +${xp} XP`, 'success');
    } else {
      addToast('Incorrect answer. Try another one!', 'error');
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-blue-500/20 animate-pulse" />
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-3/4"></div>
            <div className="space-y-2 mt-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl"></div>)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl">
        <CardContent className="p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-gray-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-300">No quizzes available</h3>
          <p className="text-gray-500 text-sm max-w-[240px] mx-auto">Check back later for new technical challenges!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl relative overflow-hidden group">
      {/* Premium accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${answered ? (isCorrect ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]') : 'bg-blue-500/30'}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            <Trophy size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Skill Check</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">{quiz?.topic}</div>
        </div>
        <CardTitle className="text-xl mt-2 leading-tight">{currentQuestion.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.question}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-2"
          >
            {currentQuestion.options.map((opt, index) => {
              let btnClass = "w-full justify-start text-left h-auto py-4 px-5 rounded-xl border transition-all duration-300 relative group/opt";
              
              if (answered) {
                if (index === currentQuestion.correct) {
                  btnClass += " bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                } else if (index === selectedOption) {
                  btnClass += " bg-red-500/10 border-red-500 text-red-400";
                } else {
                  btnClass += " bg-white/2 border-white/5 opacity-40";
                }
              } else {
                btnClass += " bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:translate-x-1";
              }

              return (
                <button
                  key={index}
                  className={btnClass}
                  onClick={() => handleAnswer(index)}
                  disabled={answered}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{opt}</span>
                    {answered && index === currentQuestion.correct && <CheckCircle2 size={18} />}
                    {answered && index === selectedOption && index !== currentQuestion.correct && <XCircle size={18} />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {answered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? `+${XP_VALUES.QUIZ_PASS} XP Earned` : 'Keep learning!'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-white/10 hover:bg-white/5"
              onClick={fetchRandomQuiz}
            >
              Next Question
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

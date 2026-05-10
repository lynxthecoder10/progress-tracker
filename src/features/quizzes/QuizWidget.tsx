import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useGamification, XP_VALUES } from '../../hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trophy, HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
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
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetchNextAvailableQuiz();
  }, []);

  const fetchNextAvailableQuiz = async () => {
    if (!user) return;
    setLoading(true);
    setAnswered(false);
    setSelectedOption(null);
    
    // 1. Get IDs of quizzes already correctly answered by the user
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('quiz_id')
      .eq('user_id', user.id)
      .eq('is_correct', true);

    const completedIds = attempts?.map(a => a.quiz_id) || [];

    // 2. Fetch a quiz that hasn't been completed
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .not('id', 'in', `(${completedIds.join(',') || '00000000-0000-0000-0000-000000000000'})`)
      .limit(1);

    if (!error && quizzes && quizzes.length > 0) {
      const randomQuiz = quizzes[0];
      setQuiz(randomQuiz);
      
      const questions = randomQuiz.questions_json;
      if (Array.isArray(questions) && questions.length > 0) {
        setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
      }
      setAllDone(false);
    } else {
      setAllDone(true);
      setQuiz(null);
      setCurrentQuestion(null);
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
      addToast('Incorrect answer. Try again with a different quiz later!', 'error');
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

  if (allDone) {
    return (
      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl">
        <CardContent className="p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
            <Sparkles className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-black text-white">Master Status Achieved!</h3>
          <p className="text-gray-500 text-sm max-w-[240px] mx-auto font-medium">You've cleared all available technical challenges for now. Check back tomorrow for new quests!</p>
        </button>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${answered ? (isCorrect ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]') : 'bg-blue-500/30'}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400">
            <Trophy size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Skill Quest</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-tighter text-gray-500 bg-white/5 px-2 py-1 rounded-md">{quiz?.topic}</div>
        </div>
        <CardTitle className="text-xl mt-2 font-bold leading-tight text-gray-100">{currentQuestion.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          {currentQuestion.options.map((opt, index) => {
            let btnClass = "w-full justify-start text-left h-auto py-4 px-5 rounded-2xl border transition-all duration-300 relative group/opt flex items-center justify-between";
            
            if (answered) {
              if (index === currentQuestion.correct) {
                btnClass += " bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.05)]";
              } else if (index === selectedOption) {
                btnClass += " bg-red-500/10 border-red-500/50 text-red-400";
              } else {
                btnClass += " bg-white/2 border-white/5 opacity-40";
              }
            } else {
              btnClass += " bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:translate-x-1 text-gray-300";
            }

            return (
              <button
                key={index}
                className={btnClass}
                onClick={() => handleAnswer(index)}
                disabled={answered}
              >
                <span className="text-sm font-bold">{opt}</span>
                {answered && index === currentQuestion.correct && <CheckCircle2 size={18} className="text-green-500" />}
                {answered && index === selectedOption && index !== currentQuestion.correct && <XCircle size={18} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? `+${XP_VALUES.QUIZ_PASS} XP Earned` : 'Quest Failed'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full border-white/10 hover:bg-white/5 font-bold"
              onClick={fetchNextAvailableQuiz}
            >
              Next Quest
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

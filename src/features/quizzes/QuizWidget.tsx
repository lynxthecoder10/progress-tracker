import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useGamification, XP_VALUES } from '../../hooks/useGamification';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trophy, CheckCircle2, XCircle, Sparkles, Lock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { BankQuestion, pickUniqueQuestions } from '../../data/questionBank';

const DAILY_LIMIT = 5;
const XP_PER_CORRECT = XP_VALUES.QUIZ_PASS;

const SUBJECT_COLORS: Record<string, string> = {
  'JavaScript': 'from-yellow-500 to-amber-600',
  'React':      'from-cyan-500 to-blue-600',
  'Git & GitHub': 'from-orange-500 to-red-600',
  'CS Fundamentals': 'from-purple-500 to-indigo-600',
};

export const QuizWidget: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const { awardXp, unlockBadge } = useGamification();

  const [queue, setQueue] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [dailyCorrect, setDailyCorrect] = useState(0);
  const [dailyAttempts, setDailyAttempts] = useState(0);

  const loadQueue = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get the start of the user's current local day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayString = startOfDay.toISOString();

    // Fetch today's attempts
    const { data: todayAttempts } = await supabase
      .from('quiz_attempts')
      .select('question_id, is_correct')
      .eq('user_id', user.id)
      .gte('created_at', todayString);

    const seenIds = todayAttempts?.map(a => a.question_id).filter(Boolean) as string[] ?? [];
    const correctCount = todayAttempts?.filter(a => a.is_correct).length ?? 0;
    const attemptCount = todayAttempts?.length ?? 0;

    setDailyCorrect(correctCount);
    setDailyAttempts(attemptCount);

    if (correctCount >= DAILY_LIMIT) {
      setAllDone(true);
      setLoading(false);
      return;
    }

    // Pick remaining unique questions for today
    const remaining = DAILY_LIMIT - correctCount;
    const questions = pickUniqueQuestions(seenIds, remaining);

    if (questions.length === 0) {
      setAllDone(true);
      setLoading(false);
      return;
    }

    setQueue(questions);
    setCurrentIndex(0);
    setAnswered(false);
    setSelectedOption(null);
    setAllDone(false);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) loadQueue();
  }, [user, loadQueue]);

  const currentQuestion = queue[currentIndex] ?? null;

  const handleAnswer = async (index: number) => {
    if (answered || !currentQuestion || !user) return;

    setSelectedOption(index);
    setAnswered(true);

    const correct = index === currentQuestion.correct;
    setIsCorrect(correct);

    // Record attempt with question_id AND score (to satisfy DB constraint)
    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      quiz_id: null,
      score: correct ? XP_PER_CORRECT : 0,
      is_correct: correct,
      question_id: currentQuestion.id,
    });

    if (correct) {
      const newCorrect = dailyCorrect + 1;
      setDailyCorrect(newCorrect);
      setDailyAttempts(prev => prev + 1);

      if (newCorrect >= 1) unlockBadge('quiz_novice');
      if (newCorrect >= 5) unlockBadge('quiz_whiz');

      await awardXp(XP_PER_CORRECT, `Answered ${currentQuestion.subject} question correctly`);
      addToast(`Correct! +${XP_PER_CORRECT} XP`, 'success');
    } else {
      setDailyAttempts(prev => prev + 1);
      addToast('Wrong answer — no XP. Keep studying!', 'error');
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < queue.length && dailyCorrect < DAILY_LIMIT) {
      setCurrentIndex(i => i + 1);
      setAnswered(false);
      setSelectedOption(null);
      setIsCorrect(false);
    } else {
      // Reload to re-evaluate remaining quota
      loadQueue();
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-amber-500/20 animate-pulse" />
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

  // ── Daily Limit Reached ───────────────────────────────────────────────────
  if (allDone) {
    return (
      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl">
        <CardContent className="p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
            <Sparkles className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-black text-white">Forge Complete!</h3>
          <p className="text-gray-500 text-sm max-w-[240px] mx-auto font-medium">
            You've answered {DAILY_LIMIT} questions correctly today. The forge resets in 24 hours — come back stronger!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < dailyCorrect ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  const subjectGradient = SUBJECT_COLORS[currentQuestion.subject] ?? 'from-gray-500 to-gray-700';

  return (
    <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl relative overflow-hidden">
      {/* Top progress bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${
        answered
          ? isCorrect
            ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
            : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          : 'bg-amber-500/40'
      }`} />

      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex items-center justify-between mb-3">
          {/* Subject badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${subjectGradient} text-white text-[10px] font-black uppercase tracking-widest`}>
            <BookOpen size={11} />
            {currentQuestion.subject}
          </div>

          {/* Daily progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                i < dailyCorrect ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]' : 'bg-white/15'
              }`} />
            ))}
          </div>
        </div>

        {/* Question — non-selectable, non-copyable */}
        <p
          className="text-lg font-bold leading-snug text-gray-100 select-none"
          onCopy={e => e.preventDefault()}
          onContextMenu={e => e.preventDefault()}
          onCut={e => e.preventDefault()}
        >
          {currentQuestion.question}
        </p>
      </CardHeader>

      <CardContent className="space-y-2 px-6 pb-6">
        <div className="space-y-2">
          {currentQuestion.options.map((opt, index) => {
            let cls =
              'w-full text-left py-3.5 px-5 rounded-2xl border text-sm font-semibold transition-all duration-300 flex items-center justify-between select-none';

            if (answered) {
              if (index === currentQuestion.correct) {
                cls += ' bg-green-500/10 border-green-500/50 text-green-300';
              } else if (index === selectedOption) {
                cls += ' bg-red-500/10 border-red-500/50 text-red-400';
              } else {
                cls += ' bg-white/2 border-white/5 text-gray-600';
              }
            } else {
              cls += ' bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/40 hover:translate-x-1 text-gray-300 cursor-pointer';
            }

            return (
              <button
                key={index}
                className={cls}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                onContextMenu={e => e.preventDefault()}
              >
                <span>{opt}</span>
                {answered && index === currentQuestion.correct && <CheckCircle2 size={16} className="text-green-400 shrink-0" />}
                {answered && index === selectedOption && index !== currentQuestion.correct && <XCircle size={16} className="text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-5 mt-2 border-t border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isCorrect ? 'bg-amber-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isCorrect ? 'text-amber-400' : 'text-red-400'}`}>
                {isCorrect ? `+${XP_PER_CORRECT} XP` : 'No XP'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {dailyCorrect}/{DAILY_LIMIT} correct
              </span>
              {dailyCorrect < DAILY_LIMIT && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-white/10 hover:bg-white/5 font-bold text-xs"
                  onClick={handleNext}
                >
                  Next →
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

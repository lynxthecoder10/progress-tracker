import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useGamification, XP_VALUES } from '../../hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Quiz {
  id: string;
  question: string;
  options: any; // JSON object or array
  correct_option_index: number;
  xp_reward: number;
}

export const QuizWidget: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const { awardXp } = useGamification();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
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
    
    // In a real app, we'd query to find a quiz the user HASN'T taken yet.
    // For now, we'll just fetch a random quiz from the db.
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .limit(10); // Fetch a few, pick random

    if (!error && data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      setQuiz(data[randomIndex]);
    }
    setLoading(false);
  };

  const handleAnswer = async (index: number) => {
    if (answered || !quiz || !user) return;

    setSelectedOption(index);
    setAnswered(true);

    const correct = index === quiz.correct_option_index;
    setIsCorrect(correct);

    // Record attempt
    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      quiz_id: quiz.id,
      selected_option_index: index,
      is_correct: correct
    });

    if (correct) {
      // Award XP based on the quiz's specific reward, or use the default PASS value
      const xp = quiz.xp_reward || XP_VALUES.QUIZ_PASS;
      await awardXp(xp, 'Completed a quiz correctly');
      addToast(`Correct! +${xp} XP`, 'success');
    } else {
      addToast('Incorrect answer. Try another one!', 'error');
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-black/60">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-3/4"></div>
            <div className="space-y-2 mt-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white/5 rounded"></div>)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card className="border-white/10 bg-black/60">
        <CardContent className="p-6 text-center text-muted-foreground">
          No quizzes available right now. Check back later!
        </CardContent>
      </Card>
    );
  }

  let optionsArray = [];
  try {
    optionsArray = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : quiz.options;
  } catch(e) {
     optionsArray = [];
  }

  return (
    <Card className="border-white/10 bg-black/60">
      <CardHeader>
        <CardTitle className="text-xl">Daily Quiz</CardTitle>
        <CardDescription>Test your knowledge for bonus XP!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-lg mb-4">{quiz.question}</p>
        
        <div className="space-y-2">
          {Array.isArray(optionsArray) && optionsArray.map((opt: string, index: number) => {
            let btnClass = "w-full justify-start text-left h-auto py-3 px-4";
            
            if (answered) {
              if (index === quiz.correct_option_index) {
                btnClass += " bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30";
              } else if (index === selectedOption) {
                btnClass += " bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30";
              } else {
                btnClass += " opacity-50";
              }
            } else {
              btnClass += " bg-white/5 border-white/10 hover:bg-white/10";
            }

            return (
              <Button
                key={index}
                variant="outline"
                className={btnClass}
                onClick={() => handleAnswer(index)}
                disabled={answered}
              >
                {opt}
              </Button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-6 text-center animate-in fade-in zoom-in duration-300">
            {isCorrect ? (
              <p className="text-green-400 font-bold text-lg">Correct! +{quiz.xp_reward || XP_VALUES.QUIZ_PASS} XP</p>
            ) : (
              <p className="text-red-400 font-bold text-lg">Incorrect! Better luck next time.</p>
            )}
            <Button variant="ghost" className="mt-4" onClick={fetchRandomQuiz}>
              Next Question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

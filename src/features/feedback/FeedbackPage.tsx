import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export const FeedbackPage: React.FC = () => {
  const { user } = useAuthStore();
  const [category, setCategory] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      category,
      message,
    });

    setLoading(false);
    if (!error) {
      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      <header className="space-y-2 text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
          <MessageSquare size={32} className="text-blue-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Give Feedback</h1>
        <p className="text-gray-400">Help us improve RankForge by sharing your thoughts.</p>
      </header>

      <Card className="border-white/10 bg-[#121214]/50 backdrop-blur-xl">
        <CardContent className="p-6 md:p-8">
          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 space-y-4 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Feedback Submitted!</h3>
              <p className="text-gray-400 max-w-sm">Thank you for helping us make RankForge better. Our admins will review it soon.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                >
                  <option value="suggestion" className="bg-zinc-900">Suggestion / Idea</option>
                  <option value="bug" className="bg-zinc-900">Bug Report</option>
                  <option value="complaint" className="bg-zinc-900">Complaint</option>
                  <option value="other" className="bg-zinc-900">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={6}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none placeholder:text-gray-600"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || !message.trim()} 
                className="w-full flex items-center justify-center gap-2 py-4"
              >
                {loading ? 'Submitting...' : 'Send Feedback'} <Send size={18} />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

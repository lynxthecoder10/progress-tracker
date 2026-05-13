-- ==========================================
-- 1. Monthly Reports
-- ==========================================
CREATE TABLE public.monthly_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  summary TEXT NOT NULL,
  key_achievements TEXT[] NOT NULL,
  blockers TEXT NOT NULL,
  quality_score INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_month UNIQUE (user_id, month_start)
);

ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all monthly reports" ON public.monthly_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert own monthly report" ON public.monthly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own monthly report" ON public.monthly_reports FOR UPDATE USING (auth.uid() = user_id);


-- ==========================================
-- 2. Feedback
-- ==========================================
CREATE TABLE public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);


-- ==========================================
-- 3. Battles
-- ==========================================
CREATE TABLE public.battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenger_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenger_start_xp INTEGER NOT NULL DEFAULT 0,
  opponent_start_xp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'declined')),
  duration_type TEXT NOT NULL CHECK (duration_type IN ('week', 'month')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view battles they are involved in" ON public.battles FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Users can create battles" ON public.battles FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update battles they are involved in" ON public.battles FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);


-- ==========================================
-- 4. Update Daily Reports Privacy
-- ==========================================
-- Drop the existing public read policy
DROP POLICY IF EXISTS "Users can view all daily reports" ON public.daily_reports;

-- Create new restrictive policy (Only owner and admins can view)
CREATE POLICY "Users can view own daily reports or admins" ON public.daily_reports 
FOR SELECT USING (
  auth.uid() = user_id 
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

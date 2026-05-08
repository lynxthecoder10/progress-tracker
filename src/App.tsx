import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import type { Session, User } from "@supabase/supabase-js";
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Flame,
  Gauge,
  Github,
  LayoutDashboard,
  Library,
  Link2,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  Rocket,
  Search,
  ShieldCheck,
  Target,
  Trophy,
  UploadCloud,
  Users,
  X,
  Zap
} from "./components/icons";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import { useTrackerData } from "./lib/store";
import type { Profile, ReportStatus, Role, TaskItem, TaskStatus, TaskType } from "./types";

type IconComponent = React.ComponentType<{ className?: string }>;

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "resources", label: "Resources", icon: Library },
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "hackathons", label: "Hackathons", icon: Rocket },
  { id: "admin", label: "Admin", icon: ShieldCheck }
] as const;

type ActiveTab = (typeof tabs)[number]["id"];

const roleLabel: Record<Role, string> = {
  admin: "Founder",
  lead: "Team Lead",
  member: "Member"
};

const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done"
};

const taskTypeLabel: Record<TaskType, string> = {
  learning: "Learning",
  build: "Build",
  team: "Team",
  hackathon: "Hackathon"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function daysUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function statusTone(status: ReportStatus | TaskStatus) {
  if (status === "approved" || status === "done") return "success";
  if (status === "blocked" || status === "needs_work") return "danger";
  if (status === "in_progress" || status === "submitted") return "warning";
  return "neutral";
}

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured && import.meta.env.VITE_ENABLE_DEMO_DATA !== "false");
  const [demoUserId, setDemoUserId] = useState("member-1");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const activeUserId = demoMode ? demoUserId : session?.user.id ?? null;
  const tracker = useTrackerData(activeUserId, demoMode || !isSupabaseConfigured);
  const { data, currentProfile } = tracker;

  const handleSignOut = async () => {
    if (demoMode) {
      setDemoMode(false);
      setActiveTab("dashboard");
      return;
    }
    await supabase?.auth.signOut();
  };

  if (!authReady) {
    return <SplashScreen />;
  }

  if (!activeUserId || !currentProfile) {
    return (
      <AuthScreen
        onDemo={() => {
          setDemoMode(true);
          setDemoUserId("member-1");
        }}
        onAuthenticated={() => setDemoMode(false)}
      />
    );
  }

  const activeMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
                <activeMeta.icon className="h-4 w-4" />
                <span>{activeMeta.label}</span>
              </div>
              <h1 className="truncate text-lg font-semibold text-slate-950">TeamOS Progress Tracker</h1>
            </div>
            {demoMode ? (
              <select
                value={demoUserId}
                onChange={(event) => setDemoUserId(event.target.value)}
                className="hidden min-w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-500 sm:block"
              >
                {data.profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            ) : null}
            <StatusPill live={!demoMode && isSupabaseConfigured} />
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-6 sm:px-6 lg:px-8"
        >
          {tracker.error ? (
            <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {tracker.error}
            </div>
          ) : null}

          {activeTab === "dashboard" ? <Dashboard tracker={tracker} /> : null}
          {activeTab === "reports" ? <Reports tracker={tracker} /> : null}
          {activeTab === "leaderboard" ? <Leaderboard profiles={data.profiles} /> : null}
          {activeTab === "resources" ? <Resources tracker={tracker} /> : null}
          {activeTab === "tasks" ? <Tasks tracker={tracker} /> : null}
          {activeTab === "hackathons" ? <Hackathons tracker={tracker} /> : null}
          {activeTab === "admin" ? <AdminPanel tracker={tracker} /> : null}
        </motion.main>
      </div>
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="h-3 w-3 animate-pulse rounded-full bg-teal-400" />
        Loading workspace
      </div>
    </div>
  );
}

function AuthScreen({ onDemo, onAuthenticated }: { onDemo: () => void; onAuthenticated: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureProfile = async (user: User, profileName?: string) => {
    if (!supabase || !user.email) return;
    const { data } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (data) return;

    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      name: profileName || user.email.split("@")[0]
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError("Supabase environment values are missing.");
      return;
    }

    setLoading(true);
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (result.data.user) {
      await ensureProfile(result.data.user, name);
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm the account.");
      return;
    }

    onAuthenticated();
  };

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex min-h-[42vh] flex-col justify-between overflow-hidden border-b border-white/10 p-6 sm:p-10 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400 text-slate-950">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">TeamOS</p>
            <p className="text-xs text-slate-400">Hackathon progress system</p>
          </div>
        </div>

        <div className="max-w-3xl py-12">
          <p className="mb-4 inline-flex rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
            Consistency over talent. Execution over excuses.
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Run your builder team from one focused dashboard.
          </h1>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <AuthStat icon={Flame} label="Streaks" value="Daily" />
            <AuthStat icon={ClipboardCheck} label="Reports" value="Weekly" />
            <AuthStat icon={Trophy} label="Ranking" value="Live" />
          </div>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          <span>Member growth</span>
          <span>Task accountability</span>
          <span>Hackathon readiness</span>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-white p-5 text-slate-950 shadow-2xl sm:p-6">
          <div className="mb-5">
            <div className="mb-3 flex rounded-md bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={classNames(
                  "flex-1 rounded px-3 py-2 text-sm font-semibold transition",
                  mode === "signin" ? "bg-white shadow-sm" : "text-slate-500"
                )}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={classNames(
                  "flex-1 rounded px-3 py-2 text-sm font-semibold transition",
                  mode === "signup" ? "bg-white shadow-sm" : "text-slate-500"
                )}
              >
                Create account
              </button>
            </div>
            <h2 className="text-xl font-semibold">{mode === "signin" ? "Welcome back" : "Join workspace"}</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="block text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-500"
                />
              </label>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                required
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-slate-950 outline-none transition focus:border-teal-500"
              />
            </label>
            {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            {message ? <p className="rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</p> : null}
            <button
              disabled={loading || !isSupabaseConfigured}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockKeyhole className="h-4 w-4" />
              {loading ? "Working" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onDemo}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Zap className="h-4 w-4" />
              Open demo workspace
            </button>
            {!isSupabaseConfigured ? (
              <p className="mt-3 text-xs text-slate-500">Add Supabase environment values to enable live auth.</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthStat({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <Icon className="mb-3 h-5 w-5 text-teal-300" />
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Sidebar({
  activeTab,
  onTabChange,
  open,
  onClose
}: {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={classNames(
          "fixed inset-0 z-40 bg-slate-950/50 transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-teal-300">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">TeamOS</p>
              <p className="text-xs text-slate-500">Progress tracker</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 lg:hidden" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={classNames(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition",
                activeTab === tab.id
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-xs font-medium uppercase text-slate-500">MVP scope</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">Auth, reports, warnings, leaderboard, resources.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function StatusPill({ live }: { live: boolean }) {
  return (
    <span
      className={classNames(
        "hidden items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex",
        live ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
      )}
    >
      <span className={classNames("h-2 w-2 rounded-full", live ? "bg-teal-500" : "bg-amber-500")} />
      {live ? "Live Supabase" : "Demo data"}
    </span>
  );
}

function Dashboard({ tracker }: { tracker: ReturnType<typeof useTrackerData> }) {
  const { data, currentProfile } = tracker;
  if (!currentProfile) return null;

  const myReports = data.weeklyReports.filter((report) => report.user_id === currentProfile.id);
  const myTasks = data.tasks.filter((task) => task.assigned_to === currentProfile.id);
  const completedTasks = myTasks.filter((task) => task.status === "done").length;
  const completionRate = myTasks.length ? Math.round((completedTasks / myTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel className="bg-slate-950 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge tone="dark">{roleLabel[currentProfile.role]}</Badge>
              <h2 className="mt-4 text-3xl font-semibold">{currentProfile.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{currentProfile.learning_track}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {currentProfile.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <MiniStat label="Score" value={currentProfile.contribution_score} />
              <MiniStat label="Attendance" value={`${currentProfile.attendance_rate}%`} />
              <MiniStat label="Commits" value={currentProfile.github_commits} />
              <MiniStat label="Projects" value={currentProfile.projects_shipped} />
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Discipline status</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                {currentProfile.warning_count === 0 ? "Clear" : `Warning ${currentProfile.warning_count}`}
              </h3>
            </div>
            <div
              className={classNames(
                "flex h-12 w-12 items-center justify-center rounded-lg",
                currentProfile.warning_count === 0 ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
              )}
            >
              {currentProfile.warning_count === 0 ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <MiniStat label="Reports" value={myReports.length} compact />
            <MiniStat label="Tasks" value={`${completionRate}%`} compact />
            <MiniStat label="Streak" value={currentProfile.streak} compact />
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Flame} label="Daily streak" value={`${currentProfile.streak} days`} detail="Consistency" />
        <MetricCard icon={Clock} label="Hours learned" value={currentProfile.hours_learned} detail="Logged" />
        <MetricCard icon={CheckCircle2} label="Tasks done" value={currentProfile.tasks_completed} detail="Completed" />
        <MetricCard icon={Gauge} label="APIs integrated" value={currentProfile.apis_integrated} detail="Build depth" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <WeeklyReportForm onSubmit={tracker.submitReport} />
        <Panel title="Current focus" icon={Target}>
          <div className="space-y-3">
            {myTasks.slice(0, 4).map((task) => (
              <TaskRow key={task.id} task={task} profile={currentProfile} onDone={tracker.completeTask} />
            ))}
            {myTasks.length === 0 ? <EmptyState label="No assigned tasks" /> : null}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Reports({ tracker }: { tracker: ReturnType<typeof useTrackerData> }) {
  const { data, currentProfile } = tracker;
  if (!currentProfile) return null;
  const isLead = currentProfile.role === "admin" || currentProfile.role === "lead";
  const reports = isLead
    ? data.weeklyReports
    : data.weeklyReports.filter((report) => report.user_id === currentProfile.id);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <WeeklyReportForm onSubmit={tracker.submitReport} />
      <Panel title="Weekly check-ins" icon={FileText}>
        <div className="space-y-3">
          {reports.map((report) => {
            const profile = data.profiles.find((item) => item.id === report.user_id);
            return (
              <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{profile?.name ?? "Member"}</p>
                    <p className="text-xs text-slate-500">{formatDate(report.submitted_at)}</p>
                  </div>
                  <Badge tone={statusTone(report.status)}>{report.status.replace("_", " ")}</Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ReportField label="Learned" value={report.learned} />
                  <ReportField label="Built" value={report.built} />
                  <ReportField label="Blockers" value={report.blockers || "None"} />
                  <ReportField label="Next goal" value={report.next_goal} />
                </div>
              </article>
            );
          })}
          {reports.length === 0 ? <EmptyState label="No reports yet" /> : null}
        </div>
      </Panel>
    </div>
  );
}

function Leaderboard({ profiles }: { profiles: Profile[] }) {
  const ranked = [...profiles].sort((a, b) => b.contribution_score - a.contribution_score);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Panel title="Leaderboard" icon={Trophy}>
        <div className="space-y-3">
          {ranked.map((profile, index) => (
            <div key={profile.id} className="grid items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[auto_1fr_auto]">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 font-semibold text-white">
                #{index + 1}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{profile.name}</p>
                  <Badge tone={profile.warning_count > 1 ? "danger" : "neutral"}>{roleLabel[profile.role]}</Badge>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-teal-500"
                    style={{ width: `${Math.min(100, profile.contribution_score)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-right text-sm sm:min-w-72">
                <MiniStat label="Score" value={profile.contribution_score} compact />
                <MiniStat label="Streak" value={profile.streak} compact />
                <MiniStat label="Help" value={profile.team_help_score} compact />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Skill matrix" icon={BookOpen}>
        <div className="space-y-4">
          {ranked.slice(0, 6).map((profile) => (
            <div key={profile.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">{profile.name}</p>
                <span className="text-xs font-medium text-slate-500">{profile.skills.length} skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Resources({ tracker }: { tracker: ReturnType<typeof useTrackerData> }) {
  const [query, setQuery] = useState("");
  const { data } = tracker;

  const filtered = data.resources.filter((resource) => {
    const haystack = `${resource.title} ${resource.category} ${resource.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <ResourceForm onSubmit={tracker.addResource} />
      <Panel title="Resource hub" icon={Library}>
        <label className="mb-4 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resources"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((resource) => {
            const uploader = data.profiles.find((profile) => profile.id === resource.uploaded_by);
            return (
              <a
                key={resource.id}
                href={resource.link}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone="neutral">{resource.category}</Badge>
                    <h3 className="mt-3 font-semibold text-slate-950 group-hover:text-teal-700">{resource.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{uploader?.name ?? "Member"}</p>
                  </div>
                  <Link2 className="h-5 w-5 text-slate-400 group-hover:text-teal-600" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs font-medium text-slate-500">{resource.upvotes} upvotes</p>
              </a>
            );
          })}
        </div>
        {filtered.length === 0 ? <EmptyState label="No matching resources" /> : null}
      </Panel>
    </div>
  );
}

function Tasks({ tracker }: { tracker: ReturnType<typeof useTrackerData> }) {
  const { data, currentProfile } = tracker;
  if (!currentProfile) return null;
  const columns: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];
  const isLead = currentProfile.role === "admin" || currentProfile.role === "lead";

  return (
    <div className="space-y-4">
      {isLead ? <TaskForm profiles={data.profiles} onSubmit={tracker.addTask} /> : null}
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((status) => (
          <Panel key={status} title={taskStatusLabel[status]} icon={ListChecks}>
            <div className="space-y-3">
              {data.tasks
                .filter((task) => task.status === status)
                .map((task) => {
                  const profile = data.profiles.find((item) => item.id === task.assigned_to);
                  return <TaskRow key={task.id} task={task} profile={profile ?? null} onDone={tracker.completeTask} />;
                })}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Hackathons({ tracker }: { tracker: ReturnType<typeof useTrackerData> }) {
  const { data } = tracker;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Panel title="Hackathon operations" icon={Rocket}>
        <div className="space-y-4">
          {data.hackathons.map((hackathon) => (
            <article key={hackathon.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Badge tone="warning">{hackathon.submission_status}</Badge>
                  <h3 className="mt-3 text-xl font-semibold text-slate-950">{hackathon.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{hackathon.idea}</p>
                </div>
                <div className="rounded-lg bg-slate-100 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase text-slate-500">Deadline</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatDate(hackathon.deadline)}</p>
                  <p className="text-xs text-slate-500">{daysUntil(hackathon.deadline)} days</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ReportField label="Project status" value={hackathon.project_status} />
                <ReportField
                  label="Team"
                  value={hackathon.team_members
                    .map((id) => data.profiles.find((profile) => profile.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {hackathon.roles_needed.map((role) => (
                  <span key={role} className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {role}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>
      <Panel title="Readiness metrics" icon={Activity}>
        <div className="grid gap-3">
          <MetricCard icon={Users} label="Active members" value={data.profiles.length} detail="Roster" />
          <MetricCard
            icon={CheckCircle2}
            label="Completed tasks"
            value={data.tasks.filter((task) => task.status === "done").length}
            detail="Build progress"
          />
          <MetricCard
            icon={UploadCloud}
            label="Shared resources"
            value={data.resources.length}
            detail="Knowledge base"
          />
        </div>
      </Panel>
    </div>
  );
}

function AdminPanel({ tracker }: { tracker: ReturnType<typeof useTrackerData> }) {
  const { data, currentProfile } = tracker;
  const [targetUser, setTargetUser] = useState(data.profiles[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [level, setLevel] = useState<1 | 2 | 3>(1);

  if (!currentProfile) return null;
  const isLead = currentProfile.role === "admin" || currentProfile.role === "lead";

  const submitWarning = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetUser || !reason.trim()) return;
    await tracker.addWarning(targetUser, reason.trim(), level);
    setReason("");
    setLevel(1);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Discipline controls" icon={ShieldCheck}>
        {isLead ? (
          <form className="space-y-4" onSubmit={submitWarning}>
            <label className="block text-sm font-medium text-slate-700">
              Member
              <select
                value={targetUser}
                onChange={(event) => setTargetUser(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500"
              >
                {data.profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Warning level
              <select
                value={level}
                onChange={(event) => setLevel(Number(event.target.value) as 1 | 2 | 3)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500"
              >
                <option value={1}>Warning 1</option>
                <option value={2}>Warning 2</option>
                <option value={3}>Removal candidate</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Note
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-500"
              />
            </label>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              <AlertTriangle className="h-4 w-4" />
              Add warning
            </button>
          </form>
        ) : (
          <EmptyState label="Lead access required" />
        )}
      </Panel>

      <Panel title="Member analytics" icon={Users}>
        <div className="space-y-3">
          {data.profiles.map((profile) => (
            <div key={profile.id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{profile.name}</p>
                  <Badge tone={profile.warning_count > 1 ? "danger" : profile.warning_count === 1 ? "warning" : "success"}>
                    {profile.warning_count === 0 ? "clear" : `warning ${profile.warning_count}`}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{profile.learning_track}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-right">
                <MiniStat label="Score" value={profile.contribution_score} compact />
                <MiniStat label="Attendance" value={`${profile.attendance_rate}%`} compact />
                <MiniStat label="Reports" value={data.weeklyReports.filter((report) => report.user_id === profile.id).length} compact />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function WeeklyReportForm({ onSubmit }: { onSubmit: ReturnType<typeof useTrackerData>["submitReport"] }) {
  const [learned, setLearned] = useState("");
  const [built, setBuilt] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextGoal, setNextGoal] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ learned, built, blockers, next_goal: nextGoal });
    setLearned("");
    setBuilt("");
    setBlockers("");
    setNextGoal("");
  };

  return (
    <Panel title="Weekly check-in" icon={ClipboardCheck}>
      <form className="space-y-4" onSubmit={submit}>
        <TextArea label="Learned" value={learned} onChange={setLearned} />
        <TextArea label="Built" value={built} onChange={setBuilt} />
        <TextArea label="Blockers" value={blockers} onChange={setBlockers} />
        <TextArea label="Next goal" value={nextGoal} onChange={setNextGoal} />
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          Submit report
        </button>
      </form>
    </Panel>
  );
}

function ResourceForm({ onSubmit }: { onSubmit: ReturnType<typeof useTrackerData>["addResource"] }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Backend");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ title, category, link, tags });
    setTitle("");
    setLink("");
    setTags("");
  };

  return (
    <Panel title="Share resource" icon={UploadCloud}>
      <form className="space-y-4" onSubmit={submit}>
        <Input label="Title" value={title} onChange={setTitle} />
        <label className="block text-sm font-medium text-slate-700">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500"
          >
            <option>Backend</option>
            <option>Frontend</option>
            <option>Design</option>
            <option>AI</option>
            <option>Ops</option>
            <option>DSA</option>
          </select>
        </label>
        <Input label="Link" value={link} onChange={setLink} type="url" />
        <Input label="Tags" value={tags} onChange={setTags} placeholder="supabase, auth, rls" />
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Add resource
        </button>
      </form>
    </Panel>
  );
}

function TaskForm({ profiles, onSubmit }: { profiles: Profile[]; onSubmit: ReturnType<typeof useTrackerData>["addTask"] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(profiles[0]?.id ?? "");
  const [taskType, setTaskType] = useState<TaskType>("learning");
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      title,
      description,
      assigned_to: assignedTo || null,
      task_type: taskType,
      deadline: new Date(deadline).toISOString()
    });
    setTitle("");
    setDescription("");
  };

  return (
    <Panel title="Assign task" icon={Plus}>
      <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
        <Input label="Title" value={title} onChange={setTitle} />
        <Input label="Description" value={description} onChange={setDescription} />
        <label className="block text-sm font-medium text-slate-700">
          Member
          <select
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Type
          <select
            value={taskType}
            onChange={(event) => setTaskType(event.target.value as TaskType)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-teal-500"
          >
            {Object.entries(taskTypeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Input label="Deadline" value={deadline} onChange={setDeadline} type="date" />
        <button className="self-end rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
          Assign
        </button>
      </form>
    </Panel>
  );
}

function TaskRow({
  task,
  profile,
  onDone
}: {
  task: TaskItem;
  profile: Profile | null;
  onDone: (taskId: string) => Promise<void>;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(task.status)}>{taskStatusLabel[task.status]}</Badge>
            <Badge tone="neutral">{taskTypeLabel[task.task_type]}</Badge>
          </div>
          <h3 className="mt-3 font-semibold text-slate-950">{task.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
        </div>
        {task.status !== "done" ? (
          <button
            type="button"
            onClick={() => void onDone(task.id)}
            className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:border-teal-300 hover:text-teal-700"
            aria-label="Mark task done"
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
        <span>{profile?.name ?? "Open team task"}</span>
        <span>{formatDate(task.deadline)}</span>
      </div>
    </article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: IconComponent;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium uppercase text-slate-400">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, compact = false }: { label: string; value: string | number; compact?: boolean }) {
  return (
    <div className={classNames("rounded-lg bg-white/10", compact ? "p-0" : "p-3")}>
      <p className={classNames("font-medium uppercase", compact ? "text-[10px] text-slate-500" : "text-xs text-slate-300")}>{label}</p>
      <p className={classNames("font-semibold", compact ? "mt-1 text-sm text-slate-950" : "mt-1 text-lg text-white")}>{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  className = ""
}: {
  title?: string;
  icon?: IconComponent;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={classNames("rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5", className)}>
      {title ? (
        <div className="mb-4 flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-teal-600" /> : null}
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "success" | "warning" | "danger" | "neutral" | "dark" }) {
  const tones = {
    success: "bg-teal-50 text-teal-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
    neutral: "bg-slate-100 text-slate-600",
    dark: "bg-white/10 text-white"
  };

  return <span className={classNames("inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize", tones[tone])}>{children}</span>;
}

function ReportField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <textarea
        required
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full resize-none rounded-md border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-500"
      />
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none transition focus:border-teal-500"
      />
    </label>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
      {label}
    </div>
  );
}

import { motion } from "framer-motion";
import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AuthScreen } from "./features/auth/AuthScreen";
import { DashboardView } from "./features/dashboard/DashboardView";
import { LeaderboardView } from "./features/leaderboard/LeaderboardView";
import { ReportsView } from "./features/reports/ReportsView";
import { ResourcesView } from "./features/resources/ResourcesView";
import { TasksView } from "./features/tasks/TasksView";
import { WarningsView } from "./features/warnings/WarningsView";
import { useAuth } from "./hooks/useAuth";
import { useTrackerData } from "./hooks/useTrackerData";
import { isDemoModeAvailable, isSupabaseConfigured } from "./lib/supabase";
import { useAppStore } from "./store/appStore";

export default function App() {
  const auth = useAuth();
  const { activeView, demoUserId, setDemoUserId } = useAppStore();
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured && isDemoModeAvailable);
  const activeUserId = auth.user?.id ?? (demoMode ? demoUserId : null);
  const tracker = useTrackerData(activeUserId, demoMode);
  const currentUser = tracker.currentUser;

  if (!auth.ready) return <SplashScreen />;

  if (!activeUserId) {
    return (
      <AuthScreen
        demoAllowed={isDemoModeAvailable}
        authError={auth.error}
        onDemo={() => {
          setDemoUserId("demo-admin");
          setDemoMode(true);
        }}
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
      />
    );
  }

  if (!currentUser) return <SplashScreen />;

  return (
    <AppShell
      users={tracker.data.users}
      currentUser={currentUser}
      activeView={activeView}
      demoMode={demoMode}
      isLive={tracker.isLive}
      onSignOut={async () => {
        setDemoMode(false);
        setDemoUserId("demo-admin");
        await auth.signOut();
      }}
    >
      {tracker.error ? (
        <div className="mb-5 rounded-lg border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-100">{tracker.error}</div>
      ) : null}
      {tracker.loading ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-6 text-sm text-zinc-400">Loading workspace...</div>
      ) : (
        <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeView === "dashboard" ? <DashboardView data={tracker.data} currentUser={currentUser} /> : null}
          {activeView === "reports" ? (
            <ReportsView data={tracker.data} currentUser={currentUser} onSubmitReport={tracker.submitWeeklyReport} />
          ) : null}
          {activeView === "leaderboard" ? <LeaderboardView data={tracker.data} /> : null}
          {activeView === "warnings" ? (
            <WarningsView data={tracker.data} currentUser={currentUser} onIssueWarning={tracker.issueWarning} />
          ) : null}
          {activeView === "resources" ? <ResourcesView data={tracker.data} onAddResource={tracker.addResource} /> : null}
          {activeView === "tasks" ? (
            <TasksView
              data={tracker.data}
              currentUser={currentUser}
              onCreateTask={tracker.createTask}
              onCompleteTask={tracker.completeTask}
            />
          ) : null}
        </motion.div>
      )}
    </AppShell>
  );
}

function SplashScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-zinc-950 text-zinc-400">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-6 text-sm">Starting ProgressTracker...</div>
    </div>
  );
}

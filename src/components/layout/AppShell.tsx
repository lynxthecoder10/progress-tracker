import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "../icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select } from "../ui/field";
import { navigationItems, viewTitles } from "./navigation";
import { cn } from "../../lib/utils";
import { useAppStore } from "../../store/appStore";
import type { UserProfile, ViewId } from "../../types";

type AppShellProps = {
  users: UserProfile[];
  currentUser: UserProfile;
  activeView: ViewId;
  demoMode: boolean;
  isLive: boolean;
  onSignOut: () => void;
  children: ReactNode;
};

export function AppShell({ users, currentUser, activeView, demoMode, isLive, onSignOut, children }: AppShellProps) {
  const { sidebarOpen, setSidebarOpen, setActiveView, demoUserId, setDemoUserId } = useAppStore();
  const title = viewTitles[activeView];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32rem),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_30rem)]" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur lg:block">
        <Sidebar activeView={activeView} onSelect={setActiveView} />
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/70" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-80 max-w-[86vw] border-r border-zinc-800 bg-zinc-950 p-4"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="mb-4 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Sidebar activeView={activeView} onSelect={setActiveView} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-zinc-50">{title.title}</h1>
                <p className="hidden truncate text-sm text-zinc-500 sm:block">{title.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone={isLive ? "success" : "warning"}>{isLive ? "Live" : "Dev"}</Badge>
              <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-7">
          {demoMode ? (
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-amber-100">Development demo data is active because Supabase credentials are not connected.</p>
              <Select value={demoUserId} onChange={(event) => setDemoUserId(event.target.value)} className="sm:w-64">
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name} · {user.role}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activeView, onSelect }: { activeView: ViewId; onSelect: (view: ViewId) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-7 px-2">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400 text-sm font-black text-zinc-950">PT</div>
          <div>
            <p className="text-sm font-semibold text-zinc-50">ProgressTracker</p>
            <p className="text-xs text-zinc-500">Private team OS</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition",
                active ? "bg-zinc-900 text-zinc-50" : "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-emerald-300" : "text-zinc-500")} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ranking Basis</p>
        <p className="mt-2 text-sm text-zinc-300">Consistency, contribution, reports, tasks, resources, growth, and activity.</p>
      </div>
    </div>
  );
}

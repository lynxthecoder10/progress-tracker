import { BarChart3, ClipboardList, Flame, Gauge, Library, ShieldAlert, Trophy } from "../icons";
import type { ViewId } from "../../types";

export const navigationItems: Array<{ id: ViewId; label: string; icon: typeof Gauge }> = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "reports", label: "Reports", icon: ClipboardList },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "warnings", label: "Warnings", icon: ShieldAlert },
  { id: "resources", label: "Resources", icon: Library },
  { id: "tasks", label: "Tasks", icon: Flame }
];

export const viewTitles: Record<ViewId, { title: string; description: string }> = {
  dashboard: {
    title: "Member Dashboard",
    description: "Personal momentum, ranking inputs, and active responsibilities."
  },
  reports: {
    title: "Weekly Reports",
    description: "Submit learning progress and review team consistency."
  },
  leaderboard: {
    title: "Leaderboard",
    description: "Priority ranking from consistency, contribution, reports, tasks, resources, growth, and activity."
  },
  warnings: {
    title: "Warning System",
    description: "Track Warning 1, Warning 2, and removal candidates."
  },
  resources: {
    title: "Resource Sharing",
    description: "Useful links and files shared by members."
  },
  tasks: {
    title: "Task Completion",
    description: "Small accountability tasks that feed member progress."
  }
};

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Flame, Gauge, Library, ShieldAlert } from "../../components/icons";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { calculateRankingScore, emptyStatsFor, getDisciplineStatus, rankMembers } from "../../lib/scoring";
import { formatDate } from "../../lib/utils";
import type { TrackerData, UserProfile } from "../../types";

type DashboardViewProps = {
  data: TrackerData;
  currentUser: UserProfile;
};

export function DashboardView({ data, currentUser }: DashboardViewProps) {
  const stats = data.leaderboardStats.find((item) => item.user_id === currentUser.id) ?? emptyStatsFor(currentUser.id);
  const discipline = getDisciplineStatus(data.warnings, currentUser);
  const score = calculateRankingScore(stats, discipline);
  const ranking = rankMembers(data.users, data.leaderboardStats, data.warnings).find((item) => item.user.id === currentUser.id);
  const assignedTasks = data.tasks.filter((task) => task.assigned_to === currentUser.id);
  const reports = data.weeklyReports.filter((report) => report.user_id === currentUser.id).slice(0, 3);
  const skills = data.skills.filter((skill) => skill.user_id === currentUser.id).slice(0, 6);

  const chartData = [
    { name: "Consistency", value: stats.consistency_score },
    { name: "Contribution", value: stats.contribution_score },
    { name: "Growth", value: stats.growth_rate },
    { name: "Activity", value: stats.activity_score }
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Gauge} label="Ranking Score" value={score} detail={ranking?.priority ?? "Lowest Priority"} tone="info" />
        <MetricCard icon={Award} label="XP Level" value={`L${stats.level}`} detail={`${stats.xp.toLocaleString()} XP`} tone="success" />
        <MetricCard icon={Flame} label="Current Streak" value={stats.current_streak} detail={`${stats.longest_streak} best`} tone="warning" />
        <MetricCard icon={ShieldAlert} label="Discipline" value={discipline} detail="Warning ladder" tone={discipline === "Clear" ? "success" : "danger"} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Priority Inputs</CardTitle>
            <CardDescription>The MVP ranking formula keeps the decision model visible.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: "rgba(39,39,42,0.55)" }}
                  contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8, color: "#fafafa" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{currentUser.display_name}</CardTitle>
            <CardDescription>{currentUser.learning_track}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Level progress</span>
                <span className="font-medium text-zinc-100">{stats.xp % 500}/500 XP</span>
              </div>
              <Progress value={(stats.xp % 500) / 5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Reports" value={stats.weekly_reports_count} />
              <MiniStat label="Tasks done" value={stats.tasks_completed} />
              <MiniStat label="Resources" value={stats.resources_shared} />
              <MiniStat label="Rank" value={ranking ? `#${ranking.rank}` : "N/A"} />
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.badges.length ? stats.badges.map((badge) => <Badge key={badge} tone="violet">{badge}</Badge>) : <Badge>No badges yet</Badge>}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Tasks</CardTitle>
            <CardDescription>Completion feeds ranking and XP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedTasks.length ? (
              assignedTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-100">{task.title}</p>
                    <Badge tone={task.status === "done" ? "success" : task.priority === "high" ? "warning" : "neutral"}>{task.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">{formatDate(task.due_at)}</p>
                </div>
              ))
            ) : (
              <EmptyLine text="No assigned tasks." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Weekly consistency signal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length ? (
              reports.map((report) => (
                <div key={report.id} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-100">{formatDate(report.week_start)}</p>
                    <Badge tone={report.status === "approved" ? "success" : "warning"}>{report.status}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{report.shipped}</p>
                </div>
              ))
            ) : (
              <EmptyLine text="No reports yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Focus</CardTitle>
            <CardDescription>Fundamentals and project readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skills.length ? (
              skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{skill.name}</p>
                    <p className="text-xs text-zinc-500">{skill.focus_area}</p>
                  </div>
                  <Badge tone="info">{skill.level.replace("_", " ")}</Badge>
                </div>
              ))
            ) : (
              <EmptyLine text="No skills recorded." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone
}: {
  icon: typeof Library;
  label: string;
  value: string | number;
  detail: string;
  tone: "success" | "warning" | "danger" | "info";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
            <p className="mt-1 text-sm text-zinc-500">{detail}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-md bg-zinc-900">
            <Icon className={tone === "success" ? "h-5 w-5 text-emerald-300" : tone === "warning" ? "h-5 w-5 text-amber-300" : tone === "danger" ? "h-5 w-5 text-rose-300" : "h-5 w-5 text-cyan-300"} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-50">{value}</p>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">{text}</p>;
}

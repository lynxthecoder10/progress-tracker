import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { rankMembers } from "../../lib/scoring";
import type { TrackerData } from "../../types";

export function LeaderboardView({ data }: { data: TrackerData }) {
  const ranked = rankMembers(data.users, data.leaderboardStats, data.warnings);
  const chartData = ranked.slice(0, 6).map((member) => ({
    name: member.user.display_name.split(" ")[0],
    score: member.score,
    xp: member.stats.xp
  }));

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Priority Leaderboard</CardTitle>
          <CardDescription>Highest Priority members get first access to hackathons, project selection, leadership, and responsibility.</CardDescription>
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
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {ranked.map((member) => (
          <Card key={member.user.id}>
            <CardContent className="p-4">
              <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-900 text-sm font-semibold text-zinc-100">
                    #{member.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-50">{member.user.display_name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{member.user.learning_track}</p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{member.priority}</span>
                    <span className="font-medium text-zinc-100">{member.score}/100</span>
                  </div>
                  <Progress value={member.score} />
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Badge tone={member.discipline === "Clear" ? "success" : member.discipline === "Warning 1" ? "warning" : "danger"}>
                    {member.discipline}
                  </Badge>
                  <Badge tone="info">L{member.stats.level}</Badge>
                  <Badge>{member.stats.xp.toLocaleString()} XP</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

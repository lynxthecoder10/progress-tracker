import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Send } from "../../components/icons";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Field, Input, Textarea } from "../../components/ui/field";
import { formatDateTime } from "../../lib/utils";
import { weeklyReportSchema, type WeeklyReportValues } from "../../lib/validation";
import type { TrackerData, UserProfile } from "../../types";

type ReportsViewProps = {
  data: TrackerData;
  currentUser: UserProfile;
  onSubmitReport: (values: WeeklyReportValues) => Promise<void>;
};

export function ReportsView({ data, currentUser, onSubmitReport }: ReportsViewProps) {
  const isAdmin = currentUser.role === "admin";
  const reports = isAdmin ? data.weeklyReports : data.weeklyReports.filter((report) => report.user_id === currentUser.id);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <ReportForm onSubmitReport={onSubmitReport} />
      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Team Reports" : "My Reports"}</CardTitle>
          <CardDescription>Reports make consistency visible and auditable.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.length ? (
            reports.map((report) => {
              const user = data.users.find((item) => item.id === report.user_id);
              return (
                <article key={report.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-zinc-50">{user?.display_name ?? "Unknown member"}</p>
                      <p className="mt-1 text-xs text-zinc-500">{formatDateTime(report.submitted_at)}</p>
                    </div>
                    <Badge tone={report.status === "approved" ? "success" : report.status === "needs_work" ? "danger" : "warning"}>
                      {report.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <ReportBlock label="Learned" value={report.learned} />
                    <ReportBlock label="Shipped" value={report.shipped} />
                    <ReportBlock label="Blockers" value={report.blockers || "None"} />
                    <ReportBlock label="Next goal" value={report.next_week_goal} />
                  </div>
                </article>
              );
            })
          ) : (
            <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">No weekly reports yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportForm({ onSubmitReport }: { onSubmitReport: (values: WeeklyReportValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WeeklyReportValues>({
    resolver: zodResolver(weeklyReportSchema),
    defaultValues: { learned: "", shipped: "", blockers: "", next_week_goal: "", hours_spent: 0 }
  });

  const submit = handleSubmit(async (values) => {
    await onSubmitReport(values);
    reset();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Weekly Report</CardTitle>
        <CardDescription>Keep it concrete: learning, output, blockers, next action.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="What you learned" error={errors.learned?.message}>
            <Textarea {...register("learned")} />
          </Field>
          <Field label="What you shipped" error={errors.shipped?.message}>
            <Textarea {...register("shipped")} />
          </Field>
          <Field label="Blockers" error={errors.blockers?.message}>
            <Textarea {...register("blockers")} />
          </Field>
          <Field label="Next week goal" error={errors.next_week_goal?.message}>
            <Textarea {...register("next_week_goal")} />
          </Field>
          <Field label="Hours spent" error={errors.hours_spent?.message}>
            <Input type="number" min={0} max={120} step={0.5} {...register("hours_spent", { valueAsNumber: true })} />
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="h-4 w-4" />
            Submit report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReportBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{value}</p>
    </div>
  );
}

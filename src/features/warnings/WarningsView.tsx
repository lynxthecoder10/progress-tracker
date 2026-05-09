import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldAlert } from "../../components/icons";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Field, Select, Textarea } from "../../components/ui/field";
import { getDisciplineStatus } from "../../lib/scoring";
import { formatDateTime } from "../../lib/utils";
import { warningSchema, type WarningValues } from "../../lib/validation";
import type { TrackerData, UserProfile } from "../../types";

type WarningsViewProps = {
  data: TrackerData;
  currentUser: UserProfile;
  onIssueWarning: (values: WarningValues) => Promise<void>;
};

export function WarningsView({ data, currentUser, onIssueWarning }: WarningsViewProps) {
  const isAdmin = currentUser.role === "admin";
  const visibleWarnings = isAdmin ? data.warnings : data.warnings.filter((warning) => warning.user_id === currentUser.id);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader>
          <CardTitle>Discipline Ladder</CardTitle>
          <CardDescription>Warnings are explicit and visible. Removal candidates should be reviewed by an admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.users.map((user) => {
            const status = getDisciplineStatus(data.warnings, user);
            return (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{user.display_name}</p>
                  <p className="text-xs text-zinc-500">{user.responsibility_level}</p>
                </div>
                <Badge tone={status === "Clear" ? "success" : status === "Warning 1" ? "warning" : "danger"}>{status}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-5">
        {isAdmin ? <WarningForm users={data.users.filter((user) => user.id !== currentUser.id)} onIssueWarning={onIssueWarning} /> : null}
        <Card>
          <CardHeader>
            <CardTitle>Warning History</CardTitle>
            <CardDescription>{isAdmin ? "Team discipline history." : "Your active and resolved warnings."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleWarnings.length ? (
              visibleWarnings.map((warning) => {
                const user = data.users.find((item) => item.id === warning.user_id);
                return (
                  <article key={warning.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-zinc-50">{user?.display_name ?? "Unknown member"}</p>
                        <p className="mt-1 text-xs text-zinc-500">{formatDateTime(warning.created_at)}</p>
                      </div>
                      <Badge tone={warning.level === 1 ? "warning" : "danger"}>
                        {warning.level === 3 ? "Removal candidate" : `Warning ${warning.level}`}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">{warning.reason}</p>
                  </article>
                );
              })
            ) : (
              <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">No warnings recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WarningForm({ users, onIssueWarning }: { users: UserProfile[]; onIssueWarning: (values: WarningValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WarningValues>({
    resolver: zodResolver(warningSchema),
    defaultValues: { user_id: users[0]?.id ?? "", level: 1, reason: "" }
  });

  const submit = handleSubmit(async (values) => {
    await onIssueWarning(values);
    reset({ user_id: users[0]?.id ?? "", level: 1, reason: "" });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Warning</CardTitle>
        <CardDescription>Admin-only action for missed reports, inactivity, low contribution, or missed responsibilities.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Member" error={errors.user_id?.message}>
            <Select {...register("user_id")}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Level" error={errors.level?.message}>
            <Select {...register("level", { valueAsNumber: true })}>
              <option value={1}>Warning 1</option>
              <option value={2}>Warning 2</option>
              <option value={3}>Removal candidate</option>
            </Select>
          </Field>
          <Field label="Reason" error={errors.reason?.message}>
            <Textarea {...register("reason")} />
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            <ShieldAlert className="h-4 w-4" />
            Add warning
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

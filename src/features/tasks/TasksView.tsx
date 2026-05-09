import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, Plus } from "../../components/icons";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Field, Input, Select, Textarea } from "../../components/ui/field";
import { formatDate } from "../../lib/utils";
import { taskSchema, type TaskValues } from "../../lib/validation";
import type { TaskItem, TrackerData, UserProfile } from "../../types";

type TasksViewProps = {
  data: TrackerData;
  currentUser: UserProfile;
  onCreateTask: (values: TaskValues) => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
};

export function TasksView({ data, currentUser, onCreateTask, onCompleteTask }: TasksViewProps) {
  const isAdmin = currentUser.role === "admin";
  const visibleTasks = isAdmin ? data.tasks : data.tasks.filter((task) => !task.assigned_to || task.assigned_to === currentUser.id);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      {isAdmin ? <TaskForm users={data.users} onCreateTask={onCreateTask} /> : <TaskSummary tasks={visibleTasks} />}
      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Team Tasks" : "My Tasks"}</CardTitle>
          <CardDescription>Small commitments that turn effort into measurable progress.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {visibleTasks.length ? (
            visibleTasks.map((task) => {
              const assignee = data.users.find((user) => user.id === task.assigned_to);
              const canComplete = task.status !== "done" && (isAdmin || task.assigned_to === currentUser.id);
              return (
                <TaskCard key={task.id} task={task} assignee={assignee} canComplete={canComplete} onCompleteTask={onCompleteTask} />
              );
            })
          ) : (
            <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">No tasks yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TaskForm({ users, onCreateTask }: { users: UserProfile[]; onCreateTask: (values: TaskValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", assigned_to: "", priority: "medium", due_at: "" }
  });

  const submit = handleSubmit(async (values) => {
    await onCreateTask(values);
    reset();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Task</CardTitle>
        <CardDescription>Use tasks for fundamentals, weekly output, and project responsibilities.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <Textarea {...register("description")} />
          </Field>
          <Field label="Assignee" error={errors.assigned_to?.message}>
            <Select {...register("assigned_to")}>
              <option value="">Anyone</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priority" error={errors.priority?.message}>
              <Select {...register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Due date" error={errors.due_at?.message}>
              <Input type="date" {...register("due_at")} />
            </Field>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Plus className="h-4 w-4" />
            Create task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TaskSummary({ tasks }: { tasks: TaskItem[] }) {
  const completed = tasks.filter((task) => task.status === "done").length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion</CardTitle>
        <CardDescription>Completing assigned tasks increases XP and ranking inputs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">{completed}</p>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500">Open</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-50">{tasks.length - completed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskCard({
  task,
  assignee,
  canComplete,
  onCompleteTask
}: {
  task: TaskItem;
  assignee?: UserProfile;
  canComplete: boolean;
  onCompleteTask: (taskId: string) => Promise<void>;
}) {
  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-zinc-50">{task.title}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{task.description || "No description."}</p>
          <p className="mt-3 text-xs text-zinc-500">
            {assignee?.display_name ?? "Anyone"} · Due {formatDate(task.due_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Badge tone={task.status === "done" ? "success" : "warning"}>{task.status.replace("_", " ")}</Badge>
          <Badge tone={task.priority === "high" ? "danger" : task.priority === "medium" ? "info" : "neutral"}>{task.priority}</Badge>
        </div>
      </div>
      {canComplete ? (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => void onCompleteTask(task.id)}>
            <CheckCircle2 className="h-4 w-4" />
            Mark done
          </Button>
        </div>
      ) : null}
    </article>
  );
}

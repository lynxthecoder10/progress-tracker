import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { demoData } from "./demoData";
import type { Resource, TaskItem, TrackerData, WeeklyReport, WarningEntry } from "../types";

type ReportInput = Pick<WeeklyReport, "learned" | "built" | "blockers" | "next_goal">;
type ResourceInput = Pick<Resource, "title" | "category" | "link"> & { tags: string };
type TaskInput = Pick<TaskItem, "title" | "description" | "assigned_to" | "task_type" | "deadline">;

const cloneDemoData = (): TrackerData => JSON.parse(JSON.stringify(demoData));

export function useTrackerData(userId: string | null, forceDemo: boolean) {
  const [data, setData] = useState<TrackerData>(() => cloneDemoData());
  const [loading, setLoading] = useState(Boolean(supabase && userId && !forceDemo));
  const [error, setError] = useState<string | null>(null);
  const isLive = Boolean(supabase && userId && !forceDemo);

  const loadLiveData = useCallback(async () => {
    if (!supabase || !userId || forceDemo) {
      setData(cloneDemoData());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [profiles, weeklyReports, tasks, resources, hackathons, warnings] = await Promise.all([
      supabase.from("profiles").select("*").order("contribution_score", { ascending: false }),
      supabase.from("weekly_reports").select("*").order("submitted_at", { ascending: false }),
      supabase.from("tasks").select("*").order("deadline", { ascending: true }),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
      supabase.from("hackathons").select("*").order("deadline", { ascending: true }),
      supabase.from("warnings").select("*").order("created_at", { ascending: false })
    ]);

    const failure = [profiles, weeklyReports, tasks, resources, hackathons, warnings].find((result) => result.error);
    if (failure?.error) {
      setError(failure.error.message);
      setLoading(false);
      return;
    }

    setData({
      profiles: profiles.data ?? [],
      weeklyReports: weeklyReports.data ?? [],
      tasks: tasks.data ?? [],
      resources: resources.data ?? [],
      hackathons: hackathons.data ?? [],
      warnings: warnings.data ?? []
    });
    setLoading(false);
  }, [forceDemo, userId]);

  useEffect(() => {
    void loadLiveData();
  }, [loadLiveData]);

  const currentProfile = useMemo(
    () => data.profiles.find((profile) => profile.id === userId) ?? data.profiles[0] ?? null,
    [data.profiles, userId]
  );

  const submitReport = useCallback(
    async (input: ReportInput) => {
      if (!userId) return;
      const report: WeeklyReport = {
        id: crypto.randomUUID(),
        user_id: userId,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        ...input
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("weekly_reports").insert({
          user_id: userId,
          learned: input.learned,
          built: input.built,
          blockers: input.blockers,
          next_goal: input.next_goal
        });
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        weeklyReports: [report, ...current.weeklyReports]
      }));
    },
    [isLive, loadLiveData, userId]
  );

  const addResource = useCallback(
    async (input: ResourceInput) => {
      if (!userId) return;
      const resource = {
        id: crypto.randomUUID(),
        uploaded_by: userId,
        upvotes: 0,
        created_at: new Date().toISOString(),
        title: input.title,
        category: input.category,
        link: input.link,
        tags: input.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("resources").insert({
          title: resource.title,
          category: resource.category,
          uploaded_by: userId,
          link: resource.link,
          tags: resource.tags
        });
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        resources: [resource, ...current.resources]
      }));
    },
    [isLive, loadLiveData, userId]
  );

  const addTask = useCallback(
    async (input: TaskInput) => {
      if (!userId) return;
      const task: TaskItem = {
        id: crypto.randomUUID(),
        created_by: userId,
        status: "todo",
        created_at: new Date().toISOString(),
        ...input
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("tasks").insert({
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to,
          created_by: userId,
          task_type: task.task_type,
          deadline: task.deadline
        });
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        tasks: [task, ...current.tasks]
      }));
    },
    [isLive, loadLiveData, userId]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (isLive && supabase) {
        const { error: updateError } = await supabase.from("tasks").update({ status: "done" }).eq("id", taskId);
        if (updateError) {
          setError(updateError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status: "done" } : task))
      }));
    },
    [isLive, loadLiveData]
  );

  const addWarning = useCallback(
    async (targetUserId: string, reason: string, level: 1 | 2 | 3) => {
      if (!userId) return;
      const warning: WarningEntry = {
        id: crypto.randomUUID(),
        user_id: targetUserId,
        issued_by: userId,
        reason,
        level,
        resolved: false,
        created_at: new Date().toISOString()
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("warnings").insert({
          user_id: targetUserId,
          issued_by: userId,
          reason,
          level
        });
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        warnings: [warning, ...current.warnings],
        profiles: current.profiles.map((profile) =>
          profile.id === targetUserId
            ? { ...profile, warning_count: Math.max(profile.warning_count, level) }
            : profile
        )
      }));
    },
    [isLive, loadLiveData, userId]
  );

  return {
    data,
    loading,
    error,
    isLive,
    currentProfile,
    reload: loadLiveData,
    submitReport,
    addResource,
    addTask,
    completeTask,
    addWarning
  };
}

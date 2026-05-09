import { useCallback, useEffect, useMemo, useState } from "react";
import { demoData } from "../lib/demoData";
import { RESOURCE_BUCKET, supabase } from "../lib/supabase";
import { getWeekStart, sanitizeFileName, toTags } from "../lib/utils";
import type { ResourceValues, TaskValues, WarningValues, WeeklyReportValues } from "../lib/validation";
import type { Resource, TaskItem, TrackerData, WarningLevel, WeeklyReport } from "../types";

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

    const [users, weeklyReports, leaderboardStats, warnings, resources, skills, tasks] = await Promise.all([
      supabase.from("users").select("*").order("display_name", { ascending: true }),
      supabase.from("weekly_reports").select("*").order("submitted_at", { ascending: false }),
      supabase.from("leaderboard_stats").select("*").order("xp", { ascending: false }),
      supabase.from("warnings").select("*").order("created_at", { ascending: false }),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("updated_at", { ascending: false }),
      supabase.from("tasks").select("*").order("created_at", { ascending: false })
    ]);

    const failed = [users, weeklyReports, leaderboardStats, warnings, resources, skills, tasks].find((result) => result.error);
    if (failed?.error) {
      setError(failed.error.message);
      setLoading(false);
      return;
    }

    setData({
      users: users.data ?? [],
      weeklyReports: weeklyReports.data ?? [],
      leaderboardStats: leaderboardStats.data ?? [],
      warnings: warnings.data ?? [],
      resources: resources.data ?? [],
      skills: skills.data ?? [],
      tasks: tasks.data ?? []
    });
    setLoading(false);
  }, [forceDemo, userId]);

  useEffect(() => {
    void loadLiveData();
  }, [loadLiveData]);

  useEffect(() => {
    if (!supabase || !isLive) return;
    const client = supabase;

    const channel = client
      .channel("progress-tracker-core")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_reports" }, () => void loadLiveData())
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_stats" }, () => void loadLiveData())
      .on("postgres_changes", { event: "*", schema: "public", table: "warnings" }, () => void loadLiveData())
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => void loadLiveData())
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => void loadLiveData())
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [isLive, loadLiveData]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === userId) ?? (forceDemo ? data.users[0] ?? null : null),
    [data.users, forceDemo, userId]
  );

  const submitWeeklyReport = useCallback(
    async (values: WeeklyReportValues) => {
      if (!userId) return;
      const payload = {
        user_id: userId,
        week_start: getWeekStart(),
        learned: values.learned,
        shipped: values.shipped,
        blockers: values.blockers || "",
        next_week_goal: values.next_week_goal,
        hours_spent: values.hours_spent
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("weekly_reports").insert(payload);
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      const report: WeeklyReport = {
        id: crypto.randomUUID(),
        status: "submitted",
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        ...payload
      };
      setData((current) => ({ ...current, weeklyReports: [report, ...current.weeklyReports] }));
    },
    [isLive, loadLiveData, userId]
  );

  const addResource = useCallback(
    async (values: ResourceValues, file?: File | null) => {
      if (!userId) return;
      let storagePath: string | null = null;

      if (file && isLive && supabase) {
        storagePath = `${userId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage.from(RESOURCE_BUCKET).upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false
        });
        if (uploadError) {
          setError(uploadError.message);
          return;
        }
      } else if (file) {
        storagePath = `${userId}/${sanitizeFileName(file.name)}`;
      }

      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        url: values.url || null,
        storage_path: storagePath,
        tags: toTags(values.tags || ""),
        uploaded_by: userId
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("resources").insert(payload);
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      const resource: Resource = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...payload
      };
      setData((current) => ({ ...current, resources: [resource, ...current.resources] }));
    },
    [isLive, loadLiveData, userId]
  );

  const issueWarning = useCallback(
    async (values: WarningValues) => {
      if (!userId) return;
      const level = values.level as WarningLevel;
      const payload = {
        user_id: values.user_id,
        issued_by: userId,
        level,
        reason: values.reason
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("warnings").insert(payload);
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        warnings: [
          {
            id: crypto.randomUUID(),
            resolved: false,
            created_at: new Date().toISOString(),
            resolved_at: null,
            ...payload
          },
          ...current.warnings
        ],
        users: current.users.map((user) =>
          user.id === values.user_id ? { ...user, warning_count: Math.max(user.warning_count, level) } : user
        )
      }));
    },
    [isLive, loadLiveData, userId]
  );

  const createTask = useCallback(
    async (values: TaskValues) => {
      if (!userId) return;
      const payload = {
        title: values.title,
        description: values.description || "",
        assigned_to: values.assigned_to || null,
        created_by: userId,
        priority: values.priority,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : null
      };

      if (isLive && supabase) {
        const { error: insertError } = await supabase.from("tasks").insert(payload);
        if (insertError) {
          setError(insertError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      const task: TaskItem = {
        id: crypto.randomUUID(),
        status: "todo",
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...payload
      };
      setData((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    },
    [isLive, loadLiveData, userId]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      if (isLive && supabase) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ status: "done", completed_at: new Date().toISOString() })
          .eq("id", taskId);
        if (updateError) {
          setError(updateError.message);
          return;
        }
        await loadLiveData();
        return;
      }

      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId ? { ...task, status: "done", completed_at: new Date().toISOString() } : task
        )
      }));
    },
    [isLive, loadLiveData]
  );

  return {
    data,
    loading,
    error,
    isLive,
    currentUser,
    reload: loadLiveData,
    submitWeeklyReport,
    addResource,
    issueWarning,
    createTask,
    completeTask
  };
}

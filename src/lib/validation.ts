import { z } from "zod";

export const authSchema = z.object({
  displayName: z.string().trim().min(2, "Name is required").max(80).optional().or(z.literal("")),
  email: z.string().trim().email("Use a valid email address"),
  password: z.string().min(8, "Use at least 8 characters")
});

export const weeklyReportSchema = z.object({
  learned: z.string().trim().min(12, "Share what changed this week"),
  shipped: z.string().trim().min(8, "List a concrete output"),
  blockers: z.string().trim().max(800).optional().or(z.literal("")),
  next_week_goal: z.string().trim().min(8, "Set a specific next goal"),
  hours_spent: z.coerce.number().min(0).max(120)
});

export const resourceSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(120),
  description: z.string().trim().min(8, "Add a short reason this is useful").max(500),
  category: z.enum(["fundamentals", "frontend", "backend", "database", "design", "hackathon", "tooling"]),
  url: z.string().trim().url("Use a valid URL").optional().or(z.literal("")),
  tags: z.string().trim().max(160).optional().or(z.literal(""))
});

export const warningSchema = z.object({
  user_id: z.string().min(1, "Choose a member"),
  level: z.coerce.number().min(1).max(3),
  reason: z.string().trim().min(10, "Explain the discipline issue").max(500)
});

export const taskSchema = z.object({
  title: z.string().trim().min(3, "Task title is required").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  due_at: z.string().optional().or(z.literal(""))
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type WeeklyReportValues = z.infer<typeof weeklyReportSchema>;
export type ResourceValues = z.infer<typeof resourceSchema>;
export type WarningValues = z.infer<typeof warningSchema>;
export type TaskValues = z.infer<typeof taskSchema>;

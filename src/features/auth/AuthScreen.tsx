import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Field, Input } from "../../components/ui/field";
import { isSupabaseConfigured } from "../../lib/supabase";
import { authSchema, type AuthFormValues } from "../../lib/validation";

type AuthScreenProps = {
  demoAllowed: boolean;
  authError: string | null;
  onDemo: () => void;
  onSignIn: (values: AuthFormValues) => Promise<{ error: Error | null } | { error: unknown }>;
  onSignUp: (values: AuthFormValues) => Promise<{ error: Error | null } | { error: unknown }>;
};

export function AuthScreen({ demoAllowed, authError, onDemo, onSignIn, onSignUp }: AuthScreenProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { displayName: "", email: "", password: "" }
  });

  const submit = handleSubmit(async (values) => {
    setMessage(null);
    const result = mode === "signup" ? await onSignUp(values) : await onSignIn(values);
    if ("error" in result && result.error) return;
    setMessage(mode === "signup" ? "Check your email if confirmations are enabled." : null);
  });

  return (
    <main className="grid min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 lg:grid-cols-[1fr_28rem] lg:px-8">
      <section className="flex items-center">
        <motion.div
          className="mx-auto w-full max-w-3xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-400 text-lg font-black text-zinc-950">
            PT
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-zinc-50 sm:text-6xl">ProgressTracker</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            A private progress system for serious builders: weekly reports, ranking, XP, streaks, warnings, and shared resources.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <AuthPoint label="Private" value="Supabase Auth" />
            <AuthPoint label="Disciplined" value="Warning flow" />
            <AuthPoint label="Gamified" value="XP and ranks" />
          </div>
        </motion.div>
      </section>

      <section className="flex items-center">
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-zinc-50">{mode === "signin" ? "Sign in" : "Create account"}</p>
                <p className="text-sm text-zinc-500">Email and password access for team members.</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-md bg-zinc-900 text-emerald-300">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            {!isSupabaseConfigured ? (
              <div className="mb-4 rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-100">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to enable live authentication.
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={submit}>
              {mode === "signup" ? (
                <Field label="Display name" error={errors.displayName?.message}>
                  <Input autoComplete="name" {...register("displayName")} />
                </Field>
              ) : null}
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" autoComplete="email" {...register("email")} />
              </Field>
              <Field label="Password" error={errors.password?.message}>
                <Input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} {...register("password")} />
              </Field>

              {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
              {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

              <Button className="w-full" type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
                {isSubmitting ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Create account" : "Use existing account"}
              </Button>
              {demoAllowed ? (
                <Button variant="secondary" size="sm" onClick={onDemo}>
                  Preview MVP
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function AuthPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

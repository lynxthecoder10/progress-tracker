import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

const dailyReportSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(100),
  progress_summary: z.string().min(20, "Summary must be detailed (at least 20 chars)").max(1000),
  tasks_completed: z.array(
    z.object({ value: z.string().min(3, "Task description too short") })
  ).min(1, "At least one task must be completed"),
  resources_used: z.array(
    z.object({ value: z.string().url("Must be a valid URL") })
  ).min(1, "At least one resource must be provided to verify learning"),
});

type DailyReportFormValues = z.infer<typeof dailyReportSchema>;

export const DailyReportForm: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<DailyReportFormValues>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      topic: '',
      progress_summary: '',
      tasks_completed: [{ value: '' }],
      resources_used: [{ value: '' }],
    }
  });

  const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
    control,
    name: "tasks_completed"
  });

  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({
    control,
    name: "resources_used"
  });

  const onSubmit = async (data: DailyReportFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Map back to arrays of strings for DB
      const tasks = data.tasks_completed.map(t => t.value);
      const resources = data.resources_used.map(r => r.value);

      const { error } = await supabase
        .from('daily_reports')
        .insert({
          user_id: user.id,
          topic: data.topic,
          progress_summary: data.progress_summary,
          tasks_completed: tasks,
          resources_used: resources,
          date: new Date().toISOString().split('T')[0] // local current date YYYY-MM-DD
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already submitted a report for today. Anti-spam triggered.');
        }
        throw error;
      }

      // Add to local XP and redirect
      // In a real app we'd have a DB trigger/function handle XP updates 
      // securely and update the frontend state accordingly.
      
      navigate('/');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="border-white/10 bg-black/60">
          <CardHeader>
            <CardTitle className="text-2xl">Daily Progress Report</CardTitle>
            <CardDescription>
              Submit your daily learning and tasks. Mandatory for streak maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Topic</label>
                <Input {...register("topic")} placeholder="e.g., React Context API" className="bg-white/5" />
                {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Detailed Progress Summary</label>
                <textarea 
                  {...register("progress_summary")} 
                  className="flex w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                  placeholder="Explain what you learned in depth to prove your activity..."
                />
                {errors.progress_summary && <p className="text-sm text-destructive">{errors.progress_summary.message}</p>}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Completed Tasks</label>
                {taskFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input {...register(`tasks_completed.${index}.value`)} placeholder="e.g., Built auth flow" className="bg-white/5" />
                    {taskFields.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeTask(index)}>X</Button>
                    )}
                  </div>
                ))}
                {errors.tasks_completed && <p className="text-sm text-destructive">{errors.tasks_completed.message}</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => appendTask({ value: '' })}>+ Add Task</Button>
              </div>

              {/* Resources List */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Resources Used (Mandatory)</label>
                {resourceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input {...register(`resources_used.${index}.value`)} placeholder="https://..." className="bg-white/5" />
                    {resourceFields.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeResource(index)}>X</Button>
                    )}
                  </div>
                ))}
                {errors.resources_used && <p className="text-sm text-destructive">{errors.resources_used.message}</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => appendResource({ value: '' })}>+ Add Resource</Button>
              </div>

              {submitError && (
                <div className="p-3 bg-destructive/20 border border-destructive rounded-md text-destructive-foreground text-sm font-medium">
                  {submitError}
                </div>
              )}

              <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Daily Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

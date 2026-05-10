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
import { startOfWeek } from 'date-fns';

const weeklyReportSchema = z.object({
  learned: z.string().min(50, "Detailed explanation of learnings required (min 50 chars)").max(2000),
  built: z.string().min(20, "Explanation of what you built is required").max(2000),
  blockers: z.string().max(1000).optional(),
  goals: z.string().min(10, "Next week's goals are required").max(1000),
  resources: z.array(
    z.object({ value: z.string().url("Must be a valid URL") })
  ).min(1, "At least one resource must be provided"),
});

type WeeklyReportFormValues = z.infer<typeof weeklyReportSchema>;

export const WeeklyReportForm: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<WeeklyReportFormValues>({
    resolver: zodResolver(weeklyReportSchema),
    defaultValues: {
      learned: '',
      built: '',
      blockers: '',
      goals: '',
      resources: [{ value: '' }],
    }
  });

  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({
    control,
    name: "resources"
  });

  const onSubmit = async (data: WeeklyReportFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const resources = data.resources.map(r => r.value);
      // Ensure we get Monday of the current week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0];

      const { error } = await supabase
        .from('weekly_reports')
        .insert({
          user_id: user.id,
          learned: data.learned,
          built: data.built,
          blockers: data.blockers || 'None',
          goals: data.goals,
          resources: resources,
          week_start: weekStart
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already submitted a weekly report for this week.');
        }
        throw error;
      }
      
      navigate('/');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit weekly report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        <Card className="border-white/10 bg-black/60">
          <CardHeader>
            <CardTitle className="text-2xl">Weekly Check-in</CardTitle>
            <CardDescription>
              Submit your comprehensive weekly review. This heavily impacts your ranking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium">What did you learn?</label>
                <textarea 
                  {...register("learned")} 
                  className="flex w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                  placeholder="Summarize the core concepts you mastered this week..."
                />
                {errors.learned && <p className="text-sm text-destructive">{errors.learned.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">What did you build?</label>
                <textarea 
                  {...register("built")} 
                  className="flex w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground min-h-[80px]"
                  placeholder="Link repos, describe projects, attach proof..."
                />
                {errors.built && <p className="text-sm text-destructive">{errors.built.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Blockers or Problems (Optional)</label>
                <textarea 
                  {...register("blockers")} 
                  className="flex w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground min-h-[60px]"
                  placeholder="Anything stopping your progress?"
                />
                {errors.blockers && <p className="text-sm text-destructive">{errors.blockers.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Goals for Next Week</label>
                <textarea 
                  {...register("goals")} 
                  className="flex w-full rounded-md border border-input bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground min-h-[80px]"
                  placeholder="What are your concrete targets for the upcoming week?"
                />
                {errors.goals && <p className="text-sm text-destructive">{errors.goals.message}</p>}
              </div>

              {/* Resources List */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Top Resources Used</label>
                {resourceFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input {...register(`resources.${index}.value`)} placeholder="https://..." className="bg-white/5" />
                    {resourceFields.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeResource(index)}>X</Button>
                    )}
                  </div>
                ))}
                {errors.resources && <p className="text-sm text-destructive">{errors.resources.message}</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => appendResource({ value: '' })}>+ Add Resource</Button>
              </div>

              {submitError && (
                <div className="p-3 bg-destructive/20 border border-destructive rounded-md text-destructive-foreground text-sm font-medium">
                  {submitError}
                </div>
              )}

              <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Weekly Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

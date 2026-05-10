import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useGamification, XP_VALUES } from '../../hooks/useGamification';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';

const resourceSchema = z.object({
  title: z.string().min(5, "Title is too short").max(100),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(['youtube', 'github', 'article', 'course', 'other']),
  tags: z.string().min(2, "Add at least one tag (comma separated)"),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

export const ResourcesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useAppStore();
  const { awardXp } = useGamification();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema)
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resources')
      .select('*, users(email)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setResources(data);
    }
    setLoading(false);
  };

  const onSubmit = async (data: ResourceFormValues) => {
    if (!user) return;
    setSubmitError('');

    try {
      const tagArray = data.tags.split(',').map(t => t.trim().toLowerCase());

      const { error } = await supabase
        .from('resources')
        .insert({
          user_id: user.id,
          title: data.title,
          url: data.url,
          type: data.type,
          tags: tagArray
        });

      if (error) {
        if (error.code === '23505') throw new Error('This resource has already been shared by someone else!');
        throw error;
      }

      await awardXp(XP_VALUES.RESOURCE_SHARED, 'Shared a new resource');
      addToast('Resource shared! +15 XP', 'success');
      reset();
      fetchResources();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to share resource');
      addToast(err.message || 'Failed to share resource', 'error');
    }
  };

  const handleUpvote = async (id: string, currentUpvotes: number) => {
    // Basic implementation. In production, we'd track who upvoted in a separate table to prevent spam.
    const { error } = await supabase
      .from('resources')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', id);
      
    if (!error) {
      fetchResources();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground">Share and discover high-quality learning materials.</p>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Submission Form */}
          <Card className="md:col-span-1 h-fit border-white/10 bg-black/60">
            <CardHeader>
              <CardTitle className="text-xl">Share a Resource</CardTitle>
              <CardDescription>Earn XP for contributing unique resources.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Input {...register("title")} placeholder="Title" className="bg-white/5" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Input {...register("url")} placeholder="https://..." className="bg-white/5" />
                  {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
                </div>
                <div className="space-y-2">
                  <select {...register("type")} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm bg-black/60 text-white">
                    <option value="youtube">YouTube Video</option>
                    <option value="article">Article / Blog</option>
                    <option value="github">GitHub Repo</option>
                    <option value="course">Course</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Input {...register("tags")} placeholder="Tags (e.g., react, hooks, api)" className="bg-white/5" />
                  {errors.tags && <p className="text-xs text-destructive">{errors.tags.message}</p>}
                </div>

                {submitError && <p className="text-sm text-destructive font-medium">{submitError}</p>}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sharing...' : 'Share Resource'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resources List */}
          <div className="md:col-span-2 space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10"></div>)}
              </div>
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <Card key={resource.id} className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    <div className="flex flex-col items-center justify-center border-r border-white/10 pr-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleUpvote(resource.id, resource.upvotes)}>
                        ▲
                      </Button>
                      <span className="font-bold text-primary">{resource.upvotes}</span>
                    </div>
                    <div className="flex-1">
                      <a href={resource.url} target="_blank" rel="noreferrer" className="text-lg font-semibold hover:underline">
                        {resource.title}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Shared by {resource.users?.email?.split('@')[0]} • {resource.type}</p>
                      <div className="flex gap-2 mt-3">
                        {resource.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-12 border border-white/10 border-dashed rounded-xl text-muted-foreground">
                No resources shared yet. Be the first!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

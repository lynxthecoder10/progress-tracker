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
import { Video, Code, FileText, GraduationCap, Link as LinkIcon, ThumbsUp, Search, Plus, ExternalLink, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { awardPoints } = useGamification();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

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
      .order('upvotes', { ascending: false });

    if (!error && data) {
      setResources(data);
    }
    setLoading(false);
  };

  const onSubmit = async (data: ResourceFormValues) => {
    if (!user) return;

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
        if (error.code === '23505') throw new Error('This resource has already been shared!');
        throw error;
      }

      await awardPoints(XP_VALUES.RESOURCE_SHARED, 'both', 'Shared a new resource');
      addToast('Resource shared! +15 XP & +15 Contribution', 'success');
      reset();
      setShowAddForm(false);
      fetchResources();
    } catch (err: any) {
      addToast(err.message || 'Failed to share resource', 'error');
    }
  };

  const handleUpvote = async (id: string, currentUpvotes: number) => {
    const { error } = await supabase
      .from('resources')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', id);
      
    if (!error) {
      setResources(resources.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Video className="text-red-500" />;
      case 'github': return <Code className="text-gray-300" />;
      case 'article': return <FileText className="text-blue-400" />;
      case 'course': return <GraduationCap className="text-purple-400" />;
      default: return <LinkIcon className="text-green-400" />;
    }
  };

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(r => r.type === filter);

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white">Resource Hub</h1>
          <p className="text-gray-500 font-medium">Curated learning materials shared by the team.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search resources..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-6 font-bold flex items-center gap-2"
          >
            <Plus size={20} /> Share
          </Button>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'youtube', 'github', 'article', 'course', 'other'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all border ${
              filter === t 
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </section>

      <div className="grid gap-8 lg:grid-cols-4 items-start">
        {/* Add Form (Mobile Drawer Style or Sidebar) */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-1 overflow-hidden"
            >
              <Card className="border-white/10 bg-[#121214]/80 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Share Something</CardTitle>
                  <CardDescription>Contribute and earn +15 XP.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                      <Input {...register("title")} placeholder="Resource Title" className="bg-white/5 border-white/10 rounded-xl" />
                      {errors.title && <p className="text-[10px] text-red-400 font-bold ml-2">{errors.title.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Input {...register("url")} placeholder="https://..." className="bg-white/5 border-white/10 rounded-xl" />
                      {errors.url && <p className="text-[10px] text-red-400 font-bold ml-2">{errors.url.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <select {...register("type")} className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-blue-500/50 outline-none">
                        <option value="youtube">YouTube Video</option>
                        <option value="github">GitHub Repo</option>
                        <option value="article">Article / Blog</option>
                        <option value="course">Course</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Input {...register("tags")} placeholder="Tags (comma separated)" className="bg-white/5 border-white/10 rounded-xl" />
                      {errors.tags && <p className="text-[10px] text-red-400 font-bold ml-2">{errors.tags.message}</p>}
                    </div>
                    <Button type="submit" className="w-full rounded-xl font-bold bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                      {isSubmitting ? 'Sharing...' : 'Confirm Share'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resources Grid */}
        <div className={`${showAddForm ? 'lg:col-span-3' : 'lg:col-span-4'} grid gap-6 md:grid-cols-2 ${showAddForm ? '' : 'xl:grid-cols-3'}`}>
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-white/5 rounded-3xl border border-white/10 animate-pulse" />
            ))
          ) : filteredResources.length > 0 ? (
            <AnimatePresence>
              {filteredResources.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full border-white/10 bg-[#121214]/40 hover:bg-[#121214]/60 hover:border-blue-500/30 transition-all duration-300 rounded-3xl overflow-hidden group">
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Top Action Bar */}
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            {getTypeIcon(resource.type)}
                          </div>
                          <button 
                            onClick={() => handleUpvote(resource.id, resource.upvotes)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black hover:bg-blue-500/20 transition-all"
                          >
                            <ThumbsUp size={14} /> {resource.upvotes}
                          </button>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-[10px]">
                              {resource.users?.email?.[0].toUpperCase()}
                            </div>
                            <span>{resource.users?.email?.split('@')[0]}</span>
                            <span>•</span>
                            <span className="capitalize">{resource.type}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {resource.tags.map((tag: string) => (
                            <div key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              <Tag size={10} /> {tag}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom External Link */}
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-blue-500/10 transition-all group/link"
                      >
                        Visit Resource <ExternalLink size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <LinkIcon size={40} className="text-gray-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-300">Nothing found here</h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">Be the first to share a valuable resource with the team and claim your bonus XP!</p>
              </div>
              <Button onClick={() => setShowAddForm(true)} className="rounded-full px-8 py-6 font-black bg-blue-600">Start Sharing</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

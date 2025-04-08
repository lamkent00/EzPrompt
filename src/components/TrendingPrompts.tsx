import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, GitFork, Zap, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TrendingPrompt {
  id: string;
  title: string;
  description: string;
  stats: {
    views: number;
    usage: number;
    likes: number;
    comments: number;
    fork_count: number;
  };
  tags: { tag: string }[];
}

export function TrendingPrompts() {
  const [prompts, setPrompts] = useState<TrendingPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrendingPrompts();
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('trending_prompts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'prompts' 
      }, handleRealtimeUpdate)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTrendingPrompts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          id,
          title,
          description,
          stats,
          prompt_tags (tag)
        `)
        .eq('is_deleted', false)
        .order('stats->views', { ascending: false })
        .limit(6);

      if (error) throw error;

      setPrompts(data || []);
    } catch (err) {
      console.error('Error loading trending prompts:', err);
      setError('Không thể tải danh sách prompt. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    if (!payload.new?.id) return;

    setPrompts(currentPrompts => {
      const updatedPrompts = [...currentPrompts];
      const index = updatedPrompts.findIndex(p => p.id === payload.new.id);

      if (index !== -1) {
        // Update existing prompt
        updatedPrompts[index] = {
          ...updatedPrompts[index],
          ...payload.new,
        };
      } else if (payload.new.stats?.views > (updatedPrompts[updatedPrompts.length - 1]?.stats?.views || 0)) {
        // Add new prompt if it has more views than the last one
        updatedPrompts.pop(); // Remove last item
        updatedPrompts.push(payload.new);
        updatedPrompts.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
      }

      return updatedPrompts;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trending Prompts
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Discover the most popular and effective prompts used by our community
            </p>
          </div>
          <div className="flex justify-center mt-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trending Prompts
            </h2>
            <div className="mt-12 flex justify-center">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trending Prompts
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Discover the most popular and effective prompts used by our community
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Link
              key={prompt.id}
              to={`/prompt/${prompt.id}`}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {prompt.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2 h-10 overflow-hidden">
                  {prompt.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prompt.tags?.map(({ tag }) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <div className="flex items-center" title="Lượt thích">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {prompt.stats?.likes?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center" title="Bình luận">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {prompt.stats?.comments?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center" title="Fork">
                    <GitFork className="h-4 w-4 mr-1" />
                    {prompt.stats?.fork_count?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center" title="Lượt sử dụng">
                    <Zap className="h-4 w-4 mr-1" />
                    {prompt.stats?.usage?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
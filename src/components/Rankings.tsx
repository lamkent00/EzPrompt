import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TopPrompt {
  id: string;
  title: string;
  stats: {
    usage: number;
    avg_rating: number;
  };
}

export function Rankings() {
  const [topUsed, setTopUsed] = useState<TopPrompt[]>([]);
  const [topRated, setTopRated] = useState<TopPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopPrompts();
  }, []);

  const loadTopPrompts = async () => {
    try {
      // Load top used prompts
      const { data: mostUsed, error: usedError } = await supabase
        .from('prompts')
        .select('id, title, stats')
        .eq('is_deleted', false)
        .order('stats->usage', { ascending: false })
        .limit(5);

      if (usedError) throw usedError;

      // Load top rated prompts
      const { data: bestRated, error: ratedError } = await supabase
        .from('prompts')
        .select('id, title, stats')
        .eq('is_deleted', false)
        .order('stats->avg_rating', { ascending: false })
        .limit(5);

      if (ratedError) throw ratedError;

      setTopUsed(mostUsed || []);
      setTopRated(bestRated || []);
    } catch (error) {
      console.error('Error loading top prompts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Bảng Xếp Hạng
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Bảng Xếp Hạng
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Top Sử Dụng</h3>
              </div>
              <div className="space-y-4">
                {topUsed.map((prompt, index) => (
                  <Link
                    key={prompt.id}
                    to={`/prompt/${prompt.id}`}
                    className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <span className="text-gray-900">
                      {index + 1}. {prompt.title}
                    </span>
                    <span className="text-indigo-600 font-medium">
                      {prompt.stats.usage.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/browse?sort=popular"
                className="mt-6 block text-center text-indigo-600 hover:text-indigo-500"
              >
                Xem đầy đủ
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Top Bình Chọn</h3>
              </div>
              <div className="space-y-4">
                {topRated.map((prompt, index) => (
                  <Link
                    key={prompt.id}
                    to={`/prompt/${prompt.id}`}
                    className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <span className="text-gray-900">
                      {index + 1}. {prompt.title}
                    </span>
                    <span className="text-indigo-600 font-medium">
                      ★{(prompt.stats?.avg_rating ?? 0).toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/browse?sort=rated"
                className="mt-6 block text-center text-indigo-600 hover:text-indigo-500"
              >
                Xem đầy đủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
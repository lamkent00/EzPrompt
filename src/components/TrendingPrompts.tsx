import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, GitFork, Zap } from 'lucide-react';

const TRENDING_PROMPTS = [
  {
    id: '1',
    title: 'Professional Email Writer',
    description: 'Generate professional emails with perfect tone and structure',
    stats: { upvotes: 1234, comments: 89, forks: 56, uses: 3421 },
    tags: ['business', 'writing', 'email'],
  },
  {
    id: '2',
    title: 'SEO Content Optimizer',
    description: 'Optimize your content for search engines while maintaining readability',
    stats: { upvotes: 987, comments: 45, forks: 34, uses: 2198 },
    tags: ['seo', 'marketing', 'content'],
  },
  {
    id: '3',
    title: 'Code Review Assistant',
    description: 'Get detailed code reviews and suggestions for improvement',
    stats: { upvotes: 876, comments: 67, forks: 23, uses: 1876 },
    tags: ['programming', 'development', 'code'],
  },
];

export function TrendingPrompts() {
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
          {TRENDING_PROMPTS.map((prompt) => (
            <Link
              key={prompt.id}
              to={`/prompt/${prompt.id}`}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {prompt.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {prompt.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
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
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {prompt.stats.upvotes}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {prompt.stats.comments}
                  </div>
                  <div className="flex items-center">
                    <GitFork className="h-4 w-4 mr-1" />
                    {prompt.stats.forks}
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    {prompt.stats.uses}
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
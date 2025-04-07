import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Copy, Play, GitFork, ChevronLeft, MessageSquare, Lock, CreditCard } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { promptService, Comment } from '../services/promptService';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Prompt {
  id: string;
  title: string;
  description: string;
  content: {
    en: string;
    vi: string;
  };
  explanation: string;
  ai_tool: string;
  purpose: string;
  author_id: string;
  author: {
    username: string;
  };
  created_at: string;
  stats: {
    views: number;
    usage: number;
    likes: number;
    comments: number;
    avg_rating: number;
    fork_count: number;
  };
  settings: {
    allowFork: boolean;
    isPublic: boolean;
    allowComments: boolean;
    price: number;
  };
  prompt_tags: { tag: string }[];
  comments: Comment[];
  relatedPrompts: Array<{
    id: string;
    title: string;
    ai_tool: string;
    prompt_tags: { tag: string }[];
  }>;
}

export default function PromptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (id) {
      loadPrompt();
      checkPurchaseStatus();
    }
  }, [id]);

  const loadPrompt = async () => {
    try {
      setIsLoading(true);
      const promptData = await promptService.getPromptById(id!);
      setPrompt(promptData);
    } catch (error) {
      console.error('Error loading prompt:', error);
      toast.error('Không thể tải thông tin prompt. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('prompt_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', id)
        .single();

      setHasPurchased(!!data);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const handlePurchase = async () => {
    if (!prompt) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để mua prompt');
        navigate('/login', { state: { returnUrl: `/prompt/${id}` } });
        return;
      }

      // Here you would integrate with a payment provider
      // For demo purposes, we'll just simulate a successful purchase
      const { error } = await supabase
        .from('prompt_purchases')
        .insert([
          {
            user_id: user.id,
            prompt_id: prompt.id,
            amount: prompt.settings.price
          }
        ]);

      if (error) throw error;

      setHasPurchased(true);
      toast.success('Mua prompt thành công!');
    } catch (error) {
      console.error('Error purchasing prompt:', error);
      toast.error('Không thể mua prompt. Vui lòng thử lại sau.');
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.content[language]);
      await promptService.copyPrompt(prompt.id);
      toast.success('Đã sao chép prompt vào clipboard!');
    } catch (error) {
      console.error('Error copying prompt:', error);
      toast.error('Không thể sao chép prompt. Vui lòng thử lại.');
    }
  };

  const handleFork = async () => {
    if (!prompt) return;

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để thực hiện fork');
        navigate('/login', { state: { returnUrl: `/prompt/${id}` } });
        return;
      }

      // Check if prompt requires purchase
      if (prompt.settings.price > 0 && !hasPurchased) {
        toast.error('Vui lòng mua prompt để thực hiện fork');
        return;
      }

      // Navigate to create prompt page with forked data
      navigate('/create-prompt', {
        state: {
          forkedPrompt: {
            title: `Fork of ${prompt.title}`,
            description: prompt.description,
            content: prompt.content,
            explanation: prompt.explanation,
            aiTool: prompt.ai_tool,
            purpose: prompt.purpose,
            tags: prompt.prompt_tags.map(t => t.tag),
            settings: {
              allowFork: true,
              isPublic: true,
              allowComments: true,
              price: 0
            }
          }
        }
      });
    } catch (error) {
      console.error('Error forking prompt:', error);
      toast.error('Không thể fork prompt. Vui lòng thử lại.');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt) return;

    try {
      setIsSubmitting(true);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để bình luận');
        navigate('/login', { state: { returnUrl: `/prompt/${id}` } });
        return;
      }

      // Validate input
      if (!newComment.trim()) {
        toast.error('Vui lòng nhập nội dung bình luận');
        return;
      }

      if (userRating === 0) {
        toast.error('Vui lòng chọn số sao đánh giá');
        return;
      }

      // Submit comment
      await promptService.addComment(prompt.id, newComment, userRating);
      
      // Reset form
      setNewComment('');
      setUserRating(0);
      
      // Reload prompt to get updated comments
      await loadPrompt();
      
      toast.success('Đã thêm bình luận thành công!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer' : ''}`}
        onClick={interactive ? () => setUserRating(i + 1) : undefined}
      />
    ));
  };

  const renderLockedContent = () => (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Nội dung này yêu cầu mua để xem
          </p>
          <button
            onClick={handlePurchase}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Mua với giá {prompt?.settings.price.toLocaleString()} VND
          </button>
        </div>
      </div>
      <div className="blur-sm">
        <div className="h-48 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy prompt này.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canViewContent = prompt.settings.price === 0 || hasPurchased;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {prompt.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {prompt.ai_tool}
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {prompt.purpose}
            </span>
            {prompt.prompt_tags.map(({ tag }) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 text-gray-600 mb-4">
            <div className="flex items-center">
              {renderStars(prompt.stats.avg_rating || 0)}
              <span className="ml-2">({prompt.stats.avg_rating?.toFixed(1) || 0})</span>
            </div>
            <span>{prompt.stats.usage} Lượt sử dụng</span>
            <span>{prompt.stats.views} Lượt xem</span>
            <span>{prompt.stats.fork_count} Lượt fork</span>
          </div>

          <div className="text-sm text-gray-500">
            Tác giả: <Link to={`/profile/${prompt.author_id}`} className="text-indigo-600 hover:text-indigo-500">
              {prompt.author?.username || 'Unknown Author'}
            </Link> | Ngày đăng: {new Date(prompt.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
          <p className="text-gray-600">{prompt.description}</p>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setLanguage('vi')}
            className={`px-4 py-2 rounded-md ${
              language === 'vi'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-md ${
              language === 'en'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            English
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Nội dung Prompt
          </h2>
          {canViewContent ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {prompt.content[language]}
                </pre>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Sao chép
                </button>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  <Play className="h-5 w-5 mr-2" />
                  Sử dụng ngay
                </button>
                {prompt.settings.allowFork && (
                  <button 
                    onClick={handleFork}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <GitFork className="h-5 w-5 mr-2" />
                    Fork ({prompt.stats.fork_count})
                  </button>
                )}
              </div>
            </>
          ) : renderLockedContent()}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Giải thích Prompt
          </h2>
          {canViewContent ? (
            <p className="text-gray-600">{prompt.explanation}</p>
          ) : renderLockedContent()}
        </div>

        {prompt.settings.allowComments && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Đánh giá và Bình luận
            </h2>

            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá của bạn
                </label>
                <div className="flex gap-1">
                  {renderStars(userRating, true)}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bình luận của bạn
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={4}
                  placeholder="Viết bình luận..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </form>

            <div className="space-y-6">
              {prompt.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Link 
                        to={`/profile/${comment.author_id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-500 mr-2"
                      >
                        {comment.author_username}
                      </Link>
                      <div className="flex">{renderStars(comment.rating)}</div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{comment.content}</p>
                </div>
              ))}

              {prompt.comments.length === 0 && (
                <p className="text-center text-gray-500">
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </p>
              )}
            </div>
          </div>
        )}

        {prompt.relatedPrompts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Prompt Liên Quan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {prompt.relatedPrompts.map((relatedPrompt) => (
                <div
                  key={relatedPrompt.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {relatedPrompt.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                      {relatedPrompt.ai_tool}
                    </span>
                    {relatedPrompt.prompt_tags.map(({ tag }) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
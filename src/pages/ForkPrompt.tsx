import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Wand2, Save, Eye, ChevronLeft, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { promptService, CreatePromptData } from '../services/promptService';
import { supabase } from '../lib/supabase';

const AI_TOOLS = ['ChatGPT', 'Gemini', 'Claude', 'Khác'];
const PURPOSES = ['Tạo ảnh', 'Nghiên cứu', 'Viết văn bản', 'Lập trình', 'Video', 'Khác'];
const SUGGESTED_TAGS = ['Công việc', 'Học tập', 'Giải trí', 'Marketing', 'SEO', 'Email'];

const initialForm: CreatePromptData = {
  title: '',
  description: '',
  content: {
    en: '',
    vi: ''
  },
  explanation: '',
  aiTool: '',
  purpose: '',
  tags: [],
  settings: {
    allowFork: true,
    isPublic: true,
    allowComments: true,
    price: 0
  }
};

export function ForkPrompt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newTag, setNewTag] = useState('');
  const [form, setForm] = useState<CreatePromptData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalPrompt, setOriginalPrompt] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadOriginalPrompt();
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Vui lòng đăng nhập để fork prompt', {
        duration: 5000,
        position: 'top-center',
      });
      navigate('/login', { state: { returnUrl: `/prompt/${id}/fork` } });
    }
  };

  const loadOriginalPrompt = async () => {
    try {
      setIsLoading(true);
      const prompt = await promptService.getPromptById(id!);
      
      if (!prompt.settings.allowFork) {
        toast.error('Prompt này không cho phép fork');
        navigate(`/prompt/${id}`);
        return;
      }

      setOriginalPrompt(prompt);
      setForm({
        title: `Fork of ${prompt.title}`,
        description: prompt.description,
        content: prompt.content,
        explanation: prompt.explanation,
        aiTool: prompt.ai_tool,
        purpose: prompt.purpose,
        tags: prompt.prompt_tags.map((t: any) => t.tag),
        settings: {
          allowFork: true,
          isPublic: true,
          allowComments: true,
          price: 0
        }
      });
    } catch (error) {
      console.error('Error loading prompt:', error);
      toast.error('Không thể tải thông tin prompt. Vui lòng thử lại sau.');
      navigate('/browse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag && !form.tags.includes(newTag)) {
      setForm({ ...form, tags: [...form.tags, newTag] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (type: 'draft' | 'preview' | 'publish') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
        navigate('/login', { state: { returnUrl: `/prompt/${id}/fork` } });
        return;
      }

      if (type === 'draft') {
        await promptService.saveDraft(form);
        toast.success('Đã lưu nháp thành công');
        return;
      }

      if (type === 'preview') {
        sessionStorage.setItem('promptPreview', JSON.stringify(form));
        navigate('/prompt/preview');
        return;
      }

      if (type === 'publish') {
        setIsSubmitting(true);

        const errors = await promptService.validatePrompt(form);
        if (errors.length > 0) {
          toast.error(errors[0]);
          setIsSubmitting(false);
          return;
        }

        // Create forked prompt with reference to original
        const prompt = await promptService.createPrompt({
          ...form,
          originalPromptId: id // Add reference to original prompt
        });
        
        promptService.clearDraft();
        
        toast.success('Đã fork prompt thành công!');
        navigate(`/prompt/${prompt.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Fork Prompt
          </h1>
          
          {originalPrompt && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Forked từ:{' '}
                <Link 
                  to={`/prompt/${originalPrompt.id}`}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  {originalPrompt.title}
                </Link>
                {' '}bởi{' '}
                <Link
                  to={`/profile/${originalPrompt.author_id}`}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {originalPrompt.author?.username}
                </Link>
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập tiêu đề prompt..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Mô tả ngắn gọn về prompt..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công cụ AI
                </label>
                <select
                  value={form.aiTool}
                  onChange={(e) => setForm({ ...form, aiTool: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Chọn công cụ AI</option>
                  {AI_TOOLS.map((tool) => (
                    <option key={tool} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mục đích sử dụng
                </label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Chọn mục đích</option>
                  {PURPOSES.map((purpose) => (
                    <option key={purpose} value={purpose}>
                      {purpose}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập và thêm tags..."
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-indigo-600 hover:text-indigo-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => !form.tags.includes(tag) && setForm({ ...form, tags: [...form.tags, tag] })}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Nội dung Prompt
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiếng Anh
              </label>
              <textarea
                value={form.content.en}
                onChange={(e) => setForm({
                  ...form,
                  content: { ...form.content, en: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows={8}
                placeholder="Nhập nội dung prompt bằng tiếng Anh..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiếng Việt (tùy chọn)
              </label>
              <textarea
                value={form.content.vi}
                onChange={(e) => setForm({
                  ...form,
                  content: { ...form.content, vi: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows={8}
                placeholder="Nhập nội dung prompt bằng tiếng Việt (nếu có)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giải thích prompt (tiếng Việt)
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows={8}
                placeholder="Giải thích chi tiết về cách sử dụng, tùy chỉnh và ví dụ kết quả..."
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Tùy chọn nâng cao
          </h2>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.settings.allowFork}
                onChange={(e) => setForm({
                  ...form,
                  settings: { ...form.settings, allowFork: e.target.checked }
                })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Cho phép fork</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.settings.isPublic}
                onChange={(e) => setForm({
                  ...form,
                  settings: { ...form.settings, isPublic: e.target.checked }
                })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Hiển thị trong tìm kiếm công khai</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.settings.allowComments}
                onChange={(e) => setForm({
                  ...form,
                  settings: { ...form.settings, allowComments: e.target.checked }
                })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Cho phép bình luận</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Save className="h-5 w-5 mr-2" />
              Lưu nháp
            </button>
            <button
              onClick={() => handleSubmit('preview')}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-5 w-5 mr-2" />
              Xem trước
            </button>
            <button
              onClick={() => handleSubmit('publish')}
              disabled={isSubmitting}
              className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Wand2 className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Đang xử lý...' : 'Fork Prompt'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
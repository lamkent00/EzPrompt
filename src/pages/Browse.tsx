import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid2X2, List, ChevronLeft, ChevronRight, Star, SlidersHorizontal } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { promptService, PromptFilters } from '../services/promptService';
import toast from 'react-hot-toast';

interface FilterState extends PromptFilters {
  aiTools: string[];
  purposes: string[];
  tags: string[];
  rating: number | null;
  search: string;
  sortBy: 'newest' | 'popular' | 'rated';
}

const INITIAL_FILTERS: FilterState = {
  aiTools: [],
  purposes: [],
  tags: [],
  rating: null,
  search: '',
  sortBy: 'newest'
};

const AI_TOOLS = ['ChatGPT', 'Gemini', 'Claude', 'Khác'];
const PURPOSES = ['Tạo ảnh', 'Nghiên cứu', 'Viết văn bản', 'Lập trình', 'Video', 'Khác'];
const TAGS = ['Công việc', 'Giải trí', 'Học tập', '18+', 'Khác'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rated', label: 'Đánh giá cao nhất' }
] as const;
const ITEMS_PER_PAGE = 12;

interface Prompt {
  id: string;
  title: string;
  description: string;
  ai_tool: string;
  purpose: string;
  prompt_tags: { tag: string }[];
  stats: {
    views: number;
    usage: number;
    likes: number;
    avg_rating: number;
    ratings_count: number;
  };
  created_at: string;
}

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    ...INITIAL_FILTERS,
    search: searchParams.get('q') || '',
    sortBy: (searchParams.get('sort') as FilterState['sortBy']) || 'newest'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    const sortQuery = searchParams.get('sort');
    if (searchQuery !== filters.search || sortQuery !== filters.sortBy) {
      setFilters(prev => ({ 
        ...prev, 
        search: searchQuery || '',
        sortBy: (sortQuery as FilterState['sortBy']) || 'newest'
      }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPrompts();
  }, [currentPage, filters]);

  const loadPrompts = async () => {
    try {
      setIsLoading(true);
      const result = await promptService.getPrompts(filters, {
        page: currentPage,
        perPage: ITEMS_PER_PAGE
      });

      setPrompts(result.prompts);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Không thể tải danh sách prompt. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSearchParams = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.sortBy !== 'newest') params.set('sort', newFilters.sortBy);
    if (newFilters.aiTools.length) params.set('tools', newFilters.aiTools.join(','));
    if (newFilters.purposes.length) params.set('purposes', newFilters.purposes.join(','));
    if (newFilters.tags.length) params.set('tags', newFilters.tags.join(','));
    if (newFilters.rating) params.set('rating', newFilters.rating.toString());
    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const applyFilters = () => {
    updateSearchParams(filters);
    setCurrentPage(1);
  };

  const renderStars = (rating: number, ratingsCount?: number) => {
    const stars = Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));

    if (ratingsCount !== undefined) {
      return (
        <div className="flex items-center">
          <div className="flex">{stars}</div>
          <span className="ml-2 text-sm text-gray-500">
            ({ratingsCount})
          </span>
        </div>
      );
    }

    return <div className="flex">{stars}</div>;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-4 py-2 rounded-md ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {filters.search && (
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Kết quả tìm kiếm cho "{filters.search}"
          </h1>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center">
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Bộ lọc
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm:
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nhập từ khóa..."
                />
              </div>

              <div>
                <h3 className="font-medium mb-3">Công cụ AI:</h3>
                <div className="space-y-2">
                  {AI_TOOLS.map((tool) => (
                    <label key={tool} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={filters.aiTools.includes(tool)}
                        onChange={(e) => {
                          const newTools = e.target.checked
                            ? [...filters.aiTools, tool]
                            : filters.aiTools.filter((t) => t !== tool);
                          setFilters({ ...filters, aiTools: newTools });
                        }}
                      />
                      <span className="ml-2">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Mục đích:</h3>
                <div className="space-y-2">
                  {PURPOSES.map((purpose) => (
                    <label key={purpose} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={filters.purposes.includes(purpose)}
                        onChange={(e) => {
                          const newPurposes = e.target.checked
                            ? [...filters.purposes, purpose]
                            : filters.purposes.filter((p) => p !== purpose);
                          setFilters({ ...filters, purposes: newPurposes });
                        }}
                      />
                      <span className="ml-2">{purpose}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Tags:</h3>
                <div className="space-y-2">
                  {TAGS.map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={filters.tags.includes(tag)}
                        onChange={(e) => {
                          const newTags = e.target.checked
                            ? [...filters.tags, tag]
                            : filters.tags.filter((t) => t !== tag);
                          setFilters({ ...filters, tags: newTags });
                        }}
                      />
                      <span className="ml-2">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Đánh giá:</h3>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={filters.rating === rating}
                        onChange={() => setFilters({ ...filters, rating })}
                      />
                      <span className="ml-2 flex items-center">
                        {renderStars(rating)}
                        {rating < 5 && <span className="ml-1">trở lên</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Áp dụng
                </button>
                <button
                  onClick={resetFilters}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => {
                      const newSortBy = e.target.value as FilterState['sortBy'];
                      setFilters({ ...filters, sortBy: newSortBy });
                      updateSearchParams({ ...filters, sortBy: newSortBy });
                    }}
                    className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 border-l pl-4">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md ${
                        viewMode === 'grid'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      <Grid2X2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md ${
                        viewMode === 'list'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'text-gray-400 hover:text-gray-500'
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <span className="text-sm text-gray-500">
                  {isLoading ? 'Đang tải...' : `Hiển thị ${prompts.length} prompt`}
                </span>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {!isLoading && prompts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy prompt nào phù hợp.</p>
              </div>
            )}

            {!isLoading && prompts.length > 0 && (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {prompts.map((prompt) => (
                  <Link
                    key={prompt.id}
                    to={`/prompt/${prompt.id}`}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {prompt.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {prompt.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                          {prompt.ai_tool}
                        </span>
                        {prompt.prompt_tags.map(({ tag }) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        {renderStars(prompt.stats.avg_rating || 0, prompt.stats.ratings_count)}
                        
                        <span className="text-sm text-gray-500">
                          {prompt.stats.usage} lượt dùng
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isLoading && prompts.length > 0 && (
              <div className="mt-8">
                {renderPagination()}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
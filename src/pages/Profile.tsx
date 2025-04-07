import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, PlusCircle, ChevronLeft, ChevronRight, Settings, BookmarkIcon, GitFork, History, Edit, ChevronDown, Trash2, AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { userService, UserProfile, UserPrompt } from '../services/userService';
import toast from 'react-hot-toast';

type SortOption = 'newest' | 'popular' | 'rated';
type ActiveTab = 'my-prompts' | 'saved' | 'forked' | 'history' | 'settings';

export function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-prompts');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadPrompts();
    }
  }, [profile, activeTab, sortBy, currentPage]);

  const loadProfile = async () => {
    try {
      const userData = await userService.getCurrentUser();
      if (!userData) {
        toast.error('Vui lòng đăng nhập để xem hồ sơ');
        navigate('/login');
        return;
      }
      setProfile(userData);
      setEditForm({
        username: userData.username,
        bio: userData.bio || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin hồ sơ');
    }
  };

  const loadPrompts = async () => {
    if (!profile) return;

    try {
      setIsLoading(true);
      let result;

      if (activeTab === 'forked') {
        result = await userService.getForkedPrompts(profile.id, currentPage);
      } else {
        result = await userService.getUserPrompts(profile.id, sortBy, currentPage);
      }

      setPrompts(result.prompts);
      setTotalPages(Math.ceil(result.total / 6)); // 6 items per page
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Không thể tải danh sách prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      await userService.updateProfile({
        ...profile,
        username: editForm.username,
        bio: editForm.bio
      });
      
      await loadProfile();
      setShowEditProfile(false);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa prompt này?')) return;

    try {
      setIsDeleting(promptId);
      await userService.deletePrompt(promptId);
      toast.success('Đã xóa prompt thành công');
      loadPrompts();
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Không thể xóa prompt');
    } finally {
      setIsDeleting(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderMenuItem = (
    id: ActiveTab,
    label: string,
    icon: React.ReactNode
  ) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setCurrentPage(1);
      }}
      className={`flex items-center w-full px-4 py-2 text-left rounded-md ${
        activeTab === id
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  if (!profile) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Hồ sơ Người dùng
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="md:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random`}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full mb-4"
                />
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="w-full px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 mb-6"
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>

              <nav className="space-y-2">
                {renderMenuItem('my-prompts', 'Prompts của tôi', <PlusCircle className="h-5 w-5" />)}
                {renderMenuItem('saved', 'Đã lưu', <BookmarkIcon className="h-5 w-5" />)}
                {renderMenuItem('forked', 'Đã fork', <GitFork className="h-5 w-5" />)}
                {renderMenuItem('history', 'Lịch sử', <History className="h-5 w-5" />)}
                {renderMenuItem('settings', 'Cài đặt', <Settings className="h-5 w-5" />)}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {profile.username}
              </h2>
              <div className="text-gray-600 mb-4">
                <p>Thành viên từ: {new Date(profile.created_at).toLocaleDateString()}</p>
                <p>Đóng góp: {profile.stats?.total_prompts || 0} prompts</p>
                <div className="flex items-center">
                  <span className="mr-2">Đánh giá:</span>
                  <div className="flex items-center">
                    {renderStars(profile.stats?.avg_rating || 0)}
                    <span className="ml-2">({profile.stats?.avg_rating?.toFixed(1) || 0})</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{profile.bio || 'Chưa có thông tin giới thiệu.'}</p>
            </div>

            {/* Edit Profile Modal */}
            {showEditProfile && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-semibold mb-4">Chỉnh sửa hồ sơ</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên người dùng
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giới thiệu
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowEditProfile(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Prompts Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {activeTab === 'my-prompts' && 'Prompts của tôi'}
                  {activeTab === 'saved' && 'Prompts đã lưu'}
                  {activeTab === 'forked' && 'Prompts đã fork'}
                  {activeTab === 'history' && 'Lịch sử sử dụng'}
                  {activeTab === 'settings' && 'Cài đặt tài khoản'}
                </h2>
                <div className="flex items-center gap-4">
                  {activeTab === 'my-prompts' && (
                    <>
                      <Link
                        to="/create-prompt"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Tạo prompt mới
                      </Link>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => {
                            setSortBy(e.target.value as SortOption);
                            setCurrentPage(1);
                          }}
                          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="newest">Mới nhất</option>
                          <option value="popular">Phổ biến nhất</option>
                          <option value="rated">Đánh giá cao nhất</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có prompt nào.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {prompt.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                            {prompt.ai_tool}
                          </span>
                          {prompt.prompt_tags.map(({ tag }) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {renderStars(prompt.stats.avg_rating || 0)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {prompt.stats.usage} lượt dùng
                          </span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/prompt/${prompt.id}/edit`}
                            className="flex-1 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            disabled={isDeleting === prompt.id}
                            className="flex-1 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 flex items-center justify-center disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting === prompt.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && prompts.length > 0 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Thống kê</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Tổng lượt sử dụng:</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profile.stats?.total_uses?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tổng lượt đánh giá:</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profile.stats?.total_ratings?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Đánh giá trung bình:</p>
                  <div className="flex items-center">
                    {renderStars(profile.stats?.avg_rating || 0)}
                    <span className="ml-2 text-2xl font-semibold text-gray-900">
                      ({profile.stats?.avg_rating?.toFixed(1) || 0})
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Tổng số prompt:</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profile.stats?.total_prompts || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
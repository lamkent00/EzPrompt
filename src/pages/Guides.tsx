import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  BookOpen, 
  Search, 
  MessageSquare, 
  GitFork, 
  Wand2, 
  Star,
  HelpCircle,
  Mail,
  PlayCircle,
  Sparkles,
  BookMarked,
  Settings
} from 'lucide-react';

export function Guides() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl">
                Hướng dẫn sử dụng EzPrompt
              </h1>
              <p className="mt-4 text-xl text-indigo-100">
                Tối ưu hóa trải nghiệm AI của bạn với hệ thống prompt thông minh
              </p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Tổng quan về EzPrompt
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                EzPrompt là nền tảng chia sẻ và tối ưu hóa prompt AI hàng đầu, giúp bạn:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Search className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Tìm kiếm prompt chất lượng
                </h3>
                <p className="text-gray-600">
                  Dễ dàng tìm kiếm prompt phù hợp với nhu cầu của bạn từ kho dữ liệu đa dạng
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Wand2 className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Tối ưu hóa prompt
                </h3>
                <p className="text-gray-600">
                  Công cụ phân tích và gợi ý cải thiện để prompt của bạn đạt hiệu quả tốt nhất
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <GitFork className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Chia sẻ và tùy chỉnh
                </h3>
                <p className="text-gray-600">
                  Fork và tùy chỉnh prompt có sẵn, chia sẻ prompt của bạn với cộng đồng
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Tính năng chính
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Search className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-medium text-gray-900">Tìm kiếm và lọc</h3>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80&w=2000"
                  alt="Search Interface"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-600 mb-4">
                  Sử dụng bộ lọc thông minh để tìm prompt phù hợp theo:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Công cụ AI (ChatGPT, Gemini, Claude...)</li>
                  <li>Mục đích sử dụng</li>
                  <li>Tags và từ khóa</li>
                  <li>Đánh giá và lượt sử dụng</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Wand2 className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-medium text-gray-900">Tối ưu hóa prompt</h3>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000"
                  alt="Optimization Tool"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-600 mb-4">
                  Công cụ phân tích và cải thiện prompt:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Phân tích cấu trúc và độ rõ ràng</li>
                  <li>Gợi ý cải thiện hiệu quả</li>
                  <li>Kiểm tra và tối ưu tokens</li>
                  <li>So sánh với prompt tương tự</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <GitFork className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-medium text-gray-900">Fork và tùy chỉnh</h3>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000"
                  alt="Fork Feature"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-600 mb-4">
                  Dễ dàng tùy chỉnh prompt có sẵn:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Fork prompt từ cộng đồng</li>
                  <li>Chỉnh sửa theo nhu cầu</li>
                  <li>Lưu vào bộ sưu tập</li>
                  <li>Chia sẻ phiên bản của bạn</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Star className="h-6 w-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-medium text-gray-900">Đánh giá và phản hồi</h3>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000"
                  alt="Rating System"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <p className="text-gray-600 mb-4">
                  Hệ thống đánh giá chất lượng:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Đánh giá và bình luận</li>
                  <li>Thống kê lượt sử dụng</li>
                  <li>Báo cáo vấn đề</li>
                  <li>Đề xuất cải thiện</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Usage Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Hướng dẫn sử dụng cơ bản
            </h2>

            <div className="space-y-12">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    1. Tìm prompt phù hợp
                  </h3>
                  <p className="text-gray-600">
                    Sử dụng thanh tìm kiếm và bộ lọc để tìm prompt phù hợp với nhu cầu của bạn.
                    Xem đánh giá và bình luận để đánh giá chất lượng prompt.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    2. Sử dụng prompt
                  </h3>
                  <p className="text-gray-600">
                    Copy prompt và sử dụng trong công cụ AI của bạn. Đọc kỹ phần giải thích và
                    hướng dẫn sử dụng đi kèm để đạt hiệu quả tốt nhất.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    3. Tối ưu và tùy chỉnh
                  </h3>
                  <p className="text-gray-600">
                    Sử dụng công cụ tối ưu để phân tích và cải thiện prompt. Fork prompt để tạo
                    phiên bản riêng và tùy chỉnh theo nhu cầu của bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
                    <BookMarked className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    4. Lưu trữ và quản lý
                  </h3>
                  <p className="text-gray-600">
                    Lưu prompt vào bộ sưu tập để sử dụng sau. Tổ chức prompt theo danh mục và
                    theo dõi lịch sử sử dụng của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Mẹo và thủ thuật
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Cho người mới bắt đầu
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Bắt đầu với các prompt đã được xác thực và có đánh giá cao
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Đọc kỹ phần giải thích và ví dụ trước khi sử dụng
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Tham khảo bình luận của người dùng khác để học hỏi kinh nghiệm
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Sử dụng công cụ tối ưu để hiểu và cải thiện prompt
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Tối ưu hóa kết quả
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Tùy chỉnh prompt theo ngữ cảnh cụ thể của bạn
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Thêm ràng buộc và yêu cầu cụ thể để có kết quả chính xác hơn
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Sử dụng phiên bản tiếng Anh cho kết quả tốt nhất
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 text-indigo-600">✓</span>
                    <span className="ml-3 text-gray-600">
                      Theo dõi và điều chỉnh dựa trên kết quả thực tế
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Câu hỏi thường gặp
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="h-6 w-6 text-indigo-600 mr-2" />
                  EzPrompt có miễn phí không?
                </h3>
                <p className="text-gray-600">
                  EzPrompt cung cấp nhiều tính năng miễn phí cho người dùng. Một số prompt
                  cao cấp có thể yêu cầu thanh toán để sử dụng. Bạn có thể kiếm điểm thưởng
                  bằng cách đóng góp prompt chất lượng cho cộng đồng.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="h-6 w-6 text-indigo-600 mr-2" />
                  Làm sao để đóng góp prompt?
                </h3>
                <p className="text-gray-600">
                  Bạn có thể dễ dàng tạo và chia sẻ prompt của mình thông qua nút "Tạo prompt mới".
                  Hãy đảm bảo prompt của bạn có giải thích chi tiết và ví dụ minh họa để giúp
                  người khác sử dụng hiệu quả.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="h-6 w-6 text-indigo-600 mr-2" />
                  Làm sao để tối ưu prompt của tôi?
                </h3>
                <p className="text-gray-600">
                  Sử dụng công cụ "Tối ưu Prompt" để phân tích và nhận gợi ý cải thiện.
                  Theo dõi số liệu thống kê và phản hồi từ cộng đồng để liên tục cải thiện
                  chất lượng prompt của bạn.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-4 flex items-center">
                  <HelpCircle className="h-6 w-6 text-indigo-600 mr-2" />
                  Tôi có thể sử dụng prompt cho mục đích thương mại không?
                </h3>
                <p className="text-gray-600">
                  Mỗi prompt có thể có điều khoản sử dụng khác nhau. Hãy kiểm tra phần
                  "Điều khoản sử dụng" của từng prompt cụ thể. Với prompt miễn phí, bạn
                  thường có thể sử dụng cho mục đích cá nhân và thương mại.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                Hỗ trợ và liên hệ
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Mail className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">support@ezprompt.com</p>
              </div>

              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600">Hỗ trợ trực tuyến 24/7</p>
              </div>

              <div className="text-center">
                <Settings className="h-8 w-8 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Trung tâm trợ giúp</h3>
                <p className="text-gray-600">Tài liệu và hướng dẫn chi tiết</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
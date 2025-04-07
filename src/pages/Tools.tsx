import React, { useState } from 'react';
import { Wand2, Copy, Share2, BookmarkPlus, Sparkles, Brain, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

type Tool = 'optimize' | 'build' | 'analyze';
type AiTool = 'chatgpt' | 'gemini' | 'claude' | 'other';

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedPrompt: string;
}

const MOCK_ANALYSIS: AnalysisResult = {
  strengths: [
    'Mục tiêu rõ ràng',
    'Cấu trúc logic',
    'Ngôn ngữ chính xác'
  ],
  weaknesses: [
    'Thiếu ràng buộc cụ thể',
    'Chưa có ví dụ minh họa',
    'Độ dài chưa tối ưu'
  ],
  suggestions: [
    'Thêm ràng buộc về định dạng đầu ra',
    'Bổ sung 1-2 ví dụ cụ thể',
    'Tối ưu độ dài prompt để tiết kiệm tokens'
  ],
  optimizedPrompt: 'Đây là phiên bản tối ưu của prompt của bạn...'
};

export function Tools() {
  const [selectedTool, setSelectedTool] = useState<Tool>('optimize');
  const [selectedAI, setSelectedAI] = useState<AiTool>('chatgpt');
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    // In a real implementation, this would call an API
    setAnalysis(MOCK_ANALYSIS);
  };

  const handleCopy = () => {
    if (analysis?.optimizedPrompt) {
      navigator.clipboard.writeText(analysis.optimizedPrompt);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Công cụ Tối ưu Prompt
        </h1>

        {/* Tool Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setSelectedTool('optimize')}
              className={`flex items-center px-6 py-3 rounded-lg ${
                selectedTool === 'optimize'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Wand2 className="h-5 w-5 mr-2" />
              Tối ưu Prompt
            </button>
            <button
              onClick={() => setSelectedTool('build')}
              className={`flex items-center px-6 py-3 rounded-lg ${
                selectedTool === 'build'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Build Prompt
            </button>
            <button
              onClick={() => setSelectedTool('analyze')}
              className={`flex items-center px-6 py-3 rounded-lg ${
                selectedTool === 'analyze'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain className="h-5 w-5 mr-2" />
              Phân tích
            </button>
          </div>
        </div>

        {/* Tool Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tối ưu Prompt</h2>
          <p className="text-gray-600">
            Công cụ này sẽ phân tích prompt của bạn và đề xuất cách cải thiện để đạt kết quả tốt hơn.
            Hệ thống sẽ đánh giá cấu trúc, độ rõ ràng, và hiệu quả của prompt, sau đó đưa ra các đề xuất
            cụ thể để tối ưu hóa.
          </p>
        </div>

        {/* AI Tool Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn công cụ AI:</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedAI('chatgpt')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedAI === 'chatgpt'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              ChatGPT
            </button>
            <button
              onClick={() => setSelectedAI('gemini')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedAI === 'gemini'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain className="h-5 w-5 mr-2" />
              Gemini
            </button>
            <button
              onClick={() => setSelectedAI('claude')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedAI === 'claude'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Claude
            </button>
            <button
              onClick={() => setSelectedAI('other')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedAI === 'other'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MoreHorizontal className="h-5 w-5 mr-2" />
              Khác
            </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nhập prompt của bạn:</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Nhập prompt cần tối ưu vào đây..."
          />
          <button
            onClick={handleAnalyze}
            className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Phân tích và tối ưu
          </button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Kết quả phân tích:</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Điểm mạnh:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Điểm yếu:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Đề xuất cải thiện:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt đã tối ưu:</h2>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {analysis.optimizedPrompt}
                </pre>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Copy className="h-5 w-5 mr-2" />
                  Sao chép
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <BookmarkPlus className="h-5 w-5 mr-2" />
                  Lưu vào tài khoản
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Share2 className="h-5 w-5 mr-2" />
                  Chia sẻ
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
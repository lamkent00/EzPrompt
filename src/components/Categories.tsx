import React from 'react';
import { MessageSquare, Brain, Sparkles, Image, BookOpen, PenTool, MoreHorizontal } from 'lucide-react';

const AI_TOOLS = [
  { name: 'ChatGPT', icon: MessageSquare },
  { name: 'Gemini', icon: Brain },
  { name: 'Claude', icon: Sparkles },
  { name: 'Khác', icon: MoreHorizontal },
];

const PURPOSES = [
  { name: 'Tạo ảnh', icon: Image },
  { name: 'Nghiên cứu', icon: BookOpen },
  { name: 'Viết văn bản', icon: PenTool },
  { name: 'Khác', icon: MoreHorizontal },
];

export function Categories() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Danh Mục Phân Loại
        </h2>
        
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Công cụ AI</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {AI_TOOLS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <Icon className="h-8 w-8 text-indigo-600 mb-3" />
                  <span className="text-gray-900 font-medium">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Mục đích sử dụng</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {PURPOSES.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <Icon className="h-8 w-8 text-indigo-600 mb-3" />
                  <span className="text-gray-900 font-medium">{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
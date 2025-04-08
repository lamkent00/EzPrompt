import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, GraduationCap } from 'lucide-react';

export function Tools() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Công Cụ Hỗ Trợ
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Link
            to="/tools"
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg overflow-hidden text-white transform hover:scale-105 transition-transform"
          >
            <div className="px-6 py-8">
              <div className="flex items-center mb-4">
                <Wand2 className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Tối Ưu Prompt</h3>
              </div>
              <p className="mb-6">
                Công cụ giúp bạn phân tích và cải thiện prompt của bạn để đạt hiệu quả tốt nhất
              </p>
              <span className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors">
                Sử dụng ngay
              </span>
            </div>
          </Link>

          <Link
            to="/guides"
            className="bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg shadow-lg overflow-hidden text-white transform hover:scale-105 transition-transform"
          >
            <div className="px-6 py-8">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Hướng Dẫn Theo Nghề</h3>
              </div>
              <p className="mb-6">
                Tìm hiểu cách sử dụng AI hiệu quả theo nghề nghiệp của bạn
              </p>
              <span className="inline-block bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors">
                Khám phá
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
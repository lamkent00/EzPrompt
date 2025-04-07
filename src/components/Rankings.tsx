import React from 'react';
import { Star, Zap } from 'lucide-react';

const TOP_USED = [
  { id: 1, name: 'Prompt A', count: '1.2k' },
  { id: 2, name: 'Prompt B', count: '950' },
  { id: 3, name: 'Prompt C', count: '820' },
  { id: 4, name: 'Prompt D', count: '780' },
  { id: 5, name: 'Prompt E', count: '650' },
];

const TOP_RATED = [
  { id: 1, name: 'Prompt X', rating: '4.9' },
  { id: 2, name: 'Prompt Y', rating: '4.8' },
  { id: 3, name: 'Prompt Z', rating: '4.7' },
  { id: 4, name: 'Prompt W', rating: '4.6' },
  { id: 5, name: 'Prompt V', rating: '4.5' },
];

export function Rankings() {
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
                {TOP_USED.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-gray-900">{item.id}. {item.name}</span>
                    <span className="text-indigo-600 font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full text-center text-indigo-600 hover:text-indigo-500">
                Xem đầy đủ
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Top Bình Chọn</h3>
              </div>
              <div className="space-y-4">
                {TOP_RATED.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-gray-900">{item.id}. {item.name}</span>
                    <span className="text-indigo-600 font-medium">★{item.rating}</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full text-center text-indigo-600 hover:text-indigo-500">
                Xem đầy đủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
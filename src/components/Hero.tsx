import React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="relative bg-indigo-800">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
          alt="People working on computers"
        />
        <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Khám phá prompt AI tốt nhất cho<br />mọi công việc của bạn
        </h1>
        <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
          Cộng đồng chia sẻ và tối ưu hóa prompt AI lớn nhất Việt Nam
        </p>
        <div className="mt-10 flex justify-center space-x-4">
          <Link
            to="/browse"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Search className="h-5 w-5 mr-2" />
            Tìm kiếm prompt
          </Link>
          <Link
            to="/create-prompt"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Tạo prompt mới
          </Link>
        </div>
      </div>
    </div>
  );
}
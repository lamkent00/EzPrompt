import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center space-x-6 mb-8">
          <a href="#" className="hover:text-white">Giới thiệu</a>
          <a href="#" className="hover:text-white">Điều khoản</a>
          <a href="#" className="hover:text-white">Liên hệ</a>
        </nav>
        <p className="text-center text-gray-400">
          © 2025 EzPrompt. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
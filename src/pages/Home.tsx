import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { TrendingPrompts } from '../components/TrendingPrompts';
import { Rankings } from '../components/Rankings';
import { Tools } from '../components/Tools';
import { Footer } from '../components/Footer';

export function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Hero />
      <Categories />
      <TrendingPrompts />
      <Rankings />
      <Tools />
      <Footer />
    </div>
  );
}
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  category: string;
  aiTool: string;
  author: {
    id: string;
    name: string;
  };
  stats: {
    upvotes: number;
    downvotes: number;
    forks: number;
    uses: number;
  };
  createdAt: string;
  updatedAt: string;
  language: 'en' | 'vi';
}

export type AiTool = 'chatgpt' | 'gemini' | 'claude' | 'other';
export type Category = 'work' | 'entertainment' | 'research' | 'image' | 'video' | 'other';
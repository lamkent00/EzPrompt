import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  stats?: {
    total_prompts: number;
    total_uses: number;
    total_ratings: number;
    avg_rating: number;
  };
}

export interface UserPrompt {
  id: string;
  title: string;
  description: string;
  ai_tool: string;
  purpose: string;
  prompt_tags: { tag: string }[];
  stats: {
    views: number;
    usage: number;
    likes: number;
    avg_rating: number;
    ratings_count: number;
  };
  created_at: string;
  is_forked: boolean;
  original_prompt_id?: string;
}

export const userService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get user stats
      const { data: stats, error: statsError } = await supabase
        .from('prompts')
        .select(`
          id,
          stats
        `)
        .eq('author_id', user.id)
        .eq('is_deleted', false);

      if (statsError) throw statsError;

      const totalPrompts = stats?.length || 0;
      const totalUses = stats?.reduce((sum, prompt) => sum + (prompt.stats?.usage || 0), 0) || 0;
      const totalRatings = stats?.reduce((sum, prompt) => sum + (prompt.stats?.ratings_count || 0), 0) || 0;
      const avgRating = totalRatings > 0
        ? stats?.reduce((sum, prompt) => sum + ((prompt.stats?.avg_rating || 0) * (prompt.stats?.ratings_count || 0)), 0) / totalRatings
        : 0;

      return {
        ...profile,
        stats: {
          total_prompts: totalPrompts,
          total_uses: totalUses,
          total_ratings: totalRatings,
          avg_rating: avgRating
        }
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      const { data: profile, error: updateError } = await supabase
        .from('users')
        .update({
          username: data.username,
          bio: data.bio,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getUserPrompts(
    userId: string,
    sortBy: 'newest' | 'popular' | 'rated' = 'newest',
    page = 1,
    perPage = 6
  ): Promise<{ prompts: UserPrompt[]; total: number }> {
    try {
      let query = supabase
        .from('prompts')
        .select(`
          *,
          prompt_tags (tag)
        `, { count: 'exact' })
        .eq('author_id', userId)
        .eq('is_deleted', false);

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('stats->usage', { ascending: false });
          break;
        case 'rated':
          query = query.order('stats->avg_rating', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data: prompts, error, count } = await query;

      if (error) throw error;

      return {
        prompts: prompts || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting user prompts:', error);
      throw error;
    }
  },

  async getForkedPrompts(
    userId: string,
    page = 1,
    perPage = 6
  ): Promise<{ prompts: UserPrompt[]; total: number }> {
    try {
      const { data: prompts, error, count } = await supabase
        .from('prompts')
        .select(`
          *,
          prompt_tags (tag),
          original_prompt:prompts!prompts_original_prompt_id_fkey (
            id,
            title,
            author_id,
            author:users!prompts_author_id_fkey (
              username
            )
          )
        `, { count: 'exact' })
        .eq('author_id', userId)
        .eq('is_deleted', false)
        .not('original_prompt_id', 'is', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (error) throw error;

      return {
        prompts: prompts || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting forked prompts:', error);
      throw error;
    }
  },

  async deletePrompt(promptId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_deleted: true })
        .eq('id', promptId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  }
};
import { supabase } from '../lib/supabase';

export interface CreatePromptData {
  title: string;
  description: string;
  content: {
    en: string;
    vi: string;
  };
  explanation: string;
  aiTool: string;
  purpose: string;
  tags: string[];
  settings: {
    allowFork: boolean;
    isPublic: boolean;
    allowComments: boolean;
    price: number;
  };
  originalPromptId?: string;
}

export interface PromptFilters {
  aiTools?: string[];
  purposes?: string[];
  tags?: string[];
  rating?: number;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rated';
}

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface Comment {
  id: string;
  author_id: string;
  author_username: string;
  author_avatar?: string;
  content: string;
  rating: number;
  created_at: string;
}

export const promptService = {
  async createPrompt(data: CreatePromptData) {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!data.title || !data.content.en) {
        throw new Error('Title and English content are required');
      }

      // If this is a fork, verify the original prompt exists and is forkable
      if (data.originalPromptId) {
        const { data: originalPrompt, error: originalError } = await supabase
          .from('prompts')
          .select('settings')
          .eq('id', data.originalPromptId)
          .single();

        if (originalError || !originalPrompt) {
          throw new Error('Original prompt not found');
        }

        if (!originalPrompt.settings.allowFork) {
          throw new Error('This prompt does not allow forking');
        }
      }

      // First, insert the prompt
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .insert([
          {
            title: data.title,
            description: data.description,
            content: data.content,
            explanation: data.explanation,
            author_id: user.id,
            author_username: user.user_metadata?.username || user.email,
            ai_tool: data.aiTool,
            purpose: data.purpose,
            original_prompt_id: data.originalPromptId,
            stats: { 
              views: 0, 
              usage: 0,
              likes: 0,
              comments: 0,
              forks: 0,
              avg_rating: 0,
              ratings_count: 0,
              fork_count: 0
            },
            settings: {
              allowFork: data.settings.allowFork,
              isPublic: data.settings.isPublic,
              allowComments: data.settings.allowComments,
              price: data.settings.price
            }
          }
        ])
        .select()
        .single();

      if (promptError) {
        throw promptError;
      }

      // Then, insert tags if any exist
      if (data.tags.length > 0) {
        const tagInserts = data.tags.map(tag => ({
          prompt_id: prompt.id,
          tag: tag.toLowerCase().trim()
        }));

        const { error: tagsError } = await supabase
          .from('prompt_tags')
          .insert(tagInserts);

        if (tagsError) {
          console.error('Error inserting tags:', tagsError);
        }
      }

      // Create an activity record
      const activityType = data.originalPromptId ? 'fork_prompt' : 'create_prompt';
      const { error: activityError } = await supabase
        .from('activities')
        .insert([
          {
            user_id: user.id,
            type: activityType,
            target_id: prompt.id,
            target_type: 'prompt',
            metadata: {
              prompt_title: prompt.title,
              original_prompt_id: data.originalPromptId
            }
          }
        ]);

      if (activityError) {
        console.error('Error creating activity:', activityError);
      }

      return prompt;
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  },

  async getPrompts(filters: PromptFilters, pagination: PaginationParams) {
    try {
      // let query = supabase
      //   .from('prompts')
      //   .select(
      //     `
      //     *,
      //     prompt_tags (tag),
      //     author:users!prompts_author_id_fkey (
      //       id,
      //       username
      //     ),
      //     original_prompt:prompts!prompts_original_prompt_id_fkey (
      //       id,
      //       title,
      //       author:users!prompts_author_id_fkey (
      //         username
      //       )
      //     )
      //   `,
      //     { count: 'exact' }
      //   )
      //   .eq('is_deleted', false);

      let query = supabase
        .from('prompts')
        .select(
          `
          *,
          prompt_tags (tag),
          author:users!prompts_author_id_fkey (
            id,
            username
          ),
          original_prompt:prompts (
            id,
            title,
            author:users!prompts_author_id_fkey (
              username
            )
          )
          `,
          { count: 'exact' }
        )
        .eq('is_deleted', false);

      // Apply search filter with correct PostgREST syntax
      if (filters.search) {
        const decodedSearch = decodeURIComponent(filters.search);
        query = query.or(
          `title.ilike.*${decodedSearch}*,description.ilike.*${decodedSearch}*`
        ).filter(
          'author.username',
          'ilike',
          `*${decodedSearch}*`
        );
      }

      // Apply other filters
      if (filters.aiTools?.length) {
        query = query.in('ai_tool', filters.aiTools);
      }

      if (filters.purposes?.length) {
        query = query.in('purpose', filters.purposes);
      }

      if (filters.tags?.length) {
        query = query.contains('prompt_tags', filters.tags);
      }

      if (filters.rating) {
        query = query.gte('stats->avg_rating', filters.rating);
      }

      // Apply sorting
      switch (filters.sortBy) {
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
      const from = (pagination.page - 1) * pagination.perPage;
      const to = from + pagination.perPage - 1;

      const { data: prompts, error, count } = await query.range(from, to);

      if (error) {
        throw error;
      }

      return {
        prompts,
        totalCount: count || 0,
        currentPage: pagination.page,
        totalPages: Math.ceil((count || 0) / pagination.perPage),
      };
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  },

  async saveDraft(data: Partial<CreatePromptData>) {
    try {
      const draftData = {
        ...data,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('promptDraft', JSON.stringify(draftData));
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  },

  getDraft() {
    try {
      const draft = localStorage.getItem('promptDraft');
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  },

  clearDraft() {
    localStorage.removeItem('promptDraft');
  },

  async validatePrompt(data: CreatePromptData) {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Tiêu đề không được để trống');
    }

    if (!data.content.en?.trim()) {
      errors.push('Nội dung tiếng Anh không được để trống');
    }

    if (!data.aiTool) {
      errors.push('Vui lòng chọn công cụ AI');
    }

    if (!data.purpose) {
      errors.push('Vui lòng chọn mục đích sử dụng');
    }

    if (data.tags.length === 0) {
      errors.push('Vui lòng thêm ít nhất một tag');
    }

    if (data.settings.price < 0) {
      errors.push('Giá không được âm');
    }

    // Additional validation for forks
    if (data.originalPromptId) {
      const { data: originalPrompt, error } = await supabase
        .from('prompts')
        .select('settings')
        .eq('id', data.originalPromptId)
        .single();

      if (error || !originalPrompt) {
        errors.push('Không tìm thấy prompt gốc');
      } else if (!originalPrompt.settings.allowFork) {
        errors.push('Prompt này không cho phép fork');
      }
    }

    return errors;
  },

  async getPromptById(id: string) {
    try {
      // Fetch the prompt with related data
      // const { data: prompt, error: promptError } = await supabase
      //   .from('prompts')
      //   .select(`
      //     *,
      //     users (
      //       id,
      //       username,
      //       avatar
      //     ),
      //     prompt_tags (
      //       tag
      //     ),
      //     comments (
      //       id,
      //       author_id,
      //       author_username,
      //       author_avatar,
      //       content,
      //       rating,
      //       created_at
      //     ),
      //     original_prompt:prompts!prompts_original_prompt_id_fkey (
      //       id,
      //       title,
      //       author:users!prompts_author_id_fkey (
      //         id,
      //         username
      //       )
      //     )
      //   `)
      //   .eq('id', id)
      //   .single();
      const { data: prompt, error: promptError } = await supabase
          .from('prompts')
          .select(`
            *,
            users (
              id,
              username,
              avatar
            ),
            prompt_tags (
              tag
            ),
            comments (
              id,
              author_id,
              author_username,
              author_avatar,
              content,
              rating,
              created_at
            ),
            original_prompt:prompts (
              id,
              title,
              author:users!prompts_author_id_fkey (
                id,
                username
              )
            )
          `)
          .eq('id', id)
          .single();

      if (promptError) {
        throw promptError;
      }

      // Increment view count
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          stats: {
            ...prompt.stats,
            views: (prompt.stats.views || 0) + 1
          }
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating view count:', updateError);
      }

      // Get related prompts
      const { data: relatedPrompts, error: relatedError } = await supabase
        .from('prompts')
        .select(`
          id,
          title,
          ai_tool,
          prompt_tags (tag)
        `)
        .neq('id', id)
        .eq('ai_tool', prompt.ai_tool)
        .limit(3);

      if (relatedError) {
        console.error('Error fetching related prompts:', relatedError);
      }

      return {
        ...prompt,
        relatedPrompts: relatedPrompts || []
      };
    } catch (error) {
      console.error('Error fetching prompt:', error);
      throw error;
    }
  },

  async addComment(promptId: string, content: string, rating: number) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Add the comment
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert([
          {
            prompt_id: promptId,
            author_id: user.id,
            author_username: user.user_metadata?.username || user.email,
            content,
            rating
          }
        ])
        .select()
        .single();

      if (commentError) {
        throw commentError;
      }

      // Update prompt stats
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('stats')
        .eq('id', promptId)
        .single();

      if (promptError) {
        throw promptError;
      }

      const currentStats = prompt.stats || {};
      const totalRatings = (currentStats.ratings_count || 0) + 1;
      const newAvgRating = (
        (currentStats.avg_rating || 0) * (totalRatings - 1) + rating
      ) / totalRatings;

      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          stats: {
            ...currentStats,
            ratings_count: totalRatings,
            avg_rating: newAvgRating,
            comments: (currentStats.comments || 0) + 1
          }
        })
        .eq('id', promptId);

      if (updateError) {
        console.error('Error updating prompt stats:', updateError);
      }

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async copyPrompt(promptId: string) {
    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is logged in, record the activity
      if (user) {
        const { error: usageError } = await supabase
          .from('activities')
          .insert([
            {
              user_id: user.id,
              type: 'copy_prompt',
              target_id: promptId,
              target_type: 'prompt'
            }
          ]);

        if (usageError) {
          console.error('Error recording usage:', usageError);
        }
      }

      // Update prompt stats regardless of user authentication
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('stats')
        .eq('id', promptId)
        .single();

      if (!promptError) {
        const { error: updateError } = await supabase
          .from('prompts')
          .update({
            stats: {
              ...prompt.stats,
              usage: (prompt.stats.usage || 0) + 1
            }
          })
          .eq('id', promptId);

        if (updateError) {
          console.error('Error updating usage stats:', updateError);
        }
      }
    } catch (error) {
      console.error('Error recording prompt usage:', error);
      // Don't throw error for guests to ensure copying still works
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return;
      }
      throw error;
    }
  }
};
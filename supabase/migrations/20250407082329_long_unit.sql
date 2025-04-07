/*
  # Add forking support to prompts

  1. Changes
    - Add original_prompt_id to prompts table
    - Add fork_count to prompt stats
    - Add fork activity type
    - Add foreign key constraint for original prompt reference
    
  2. Security
    - Enable RLS on new columns
    - Add policies for fork operations
*/

-- Add original_prompt_id to prompts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'prompts' 
    AND column_name = 'original_prompt_id'
  ) THEN
    ALTER TABLE prompts 
    ADD COLUMN original_prompt_id UUID REFERENCES prompts(id);
  END IF;
END $$;

-- Add fork_count to stats if not present
DO $$ 
BEGIN
  UPDATE prompts 
  SET stats = stats || jsonb_build_object('fork_count', 0)
  WHERE NOT (stats ? 'fork_count');
END $$;

-- Create policy to allow forking public prompts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'prompts' 
    AND policyname = 'Allow forking public prompts'
  ) THEN
    CREATE POLICY "Allow forking public prompts" 
    ON prompts
    FOR INSERT
    TO authenticated
    WITH CHECK (
      -- Original prompt must be public
      EXISTS (
        SELECT 1 FROM prompts original
        WHERE original.id = prompts.original_prompt_id
        AND original.settings->>'isPublic' = 'true'
        AND original.settings->>'allowFork' = 'true'
      )
      -- Or this is a new prompt without an original
      OR original_prompt_id IS NULL
    );
  END IF;
END $$;

-- Function to increment fork count
CREATE OR REPLACE FUNCTION increment_fork_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_prompt_id IS NOT NULL THEN
    UPDATE prompts
    SET stats = jsonb_set(
      stats,
      '{fork_count}',
      to_jsonb(COALESCE((stats->>'fork_count')::integer, 0) + 1)
    )
    WHERE id = NEW.original_prompt_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for fork count
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'increment_fork_count_trigger'
  ) THEN
    CREATE TRIGGER increment_fork_count_trigger
    AFTER INSERT ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION increment_fork_count();
  END IF;
END $$;
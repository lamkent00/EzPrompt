/*
  # Add version history for prompts

  1. New Tables
    - `prompt_versions`
      - `id` (uuid, primary key)
      - `prompt_id` (uuid, references prompts)
      - `content` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on prompt_versions table
    - Add policies for version history access
*/

-- Create prompt_versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

-- Policies for prompt_versions
CREATE POLICY "Users can view versions of their own prompts"
  ON prompt_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_versions.prompt_id
      AND prompts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions of their own prompts"
  ON prompt_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_versions.prompt_id
      AND prompts.author_id = auth.uid()
    )
  );
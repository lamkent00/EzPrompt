/*
  # Add purchase support for prompts

  1. New Tables
    - `purchased_prompts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `prompt_id` (uuid, references prompts)
      - `purchased_at` (timestamp)
      - `amount` (integer)

  2. Changes
    - Add `points` column to users table
    
  3. Security
    - Enable RLS on purchased_prompts table
    - Add policies for purchased prompts
*/

-- Add points column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1000;

-- Create purchased_prompts table
CREATE TABLE IF NOT EXISTS purchased_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  prompt_id UUID REFERENCES prompts(id) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  amount INTEGER NOT NULL,
  UNIQUE(user_id, prompt_id)
);

-- Enable RLS
ALTER TABLE purchased_prompts ENABLE ROW LEVEL SECURITY;

-- Policies for purchased_prompts
CREATE POLICY "Users can view their own purchases"
  ON purchased_prompts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON purchased_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle prompt purchase
CREATE OR REPLACE FUNCTION purchase_prompt(prompt_id UUID, amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_points INTEGER;
BEGIN
  -- Get user's current points
  SELECT points INTO user_points
  FROM users
  WHERE id = auth.uid();

  -- Check if user has enough points
  IF user_points < amount THEN
    RETURN FALSE;
  END IF;

  -- Begin transaction
  BEGIN
    -- Deduct points from user
    UPDATE users
    SET points = points - amount
    WHERE id = auth.uid();

    -- Create purchase record
    INSERT INTO purchased_prompts (user_id, prompt_id, amount)
    VALUES (auth.uid(), prompt_id, amount);

    RETURN TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN FALSE;
  END;
END;
$$;
/*
  # Create demo user and fix schema

  1. Changes
    - Remove password field from users table as it's managed by Supabase Auth
    - Insert demo user with basic information
    
  2. Security
    - User is created with basic role
    - Password is managed by Supabase Auth
*/

-- Remove password column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE users DROP COLUMN password;
  END IF;
END $$;

-- Insert demo user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo@gmail.com',
  crypt('demo', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Get the user id from the auth.users table
DO $$
DECLARE
  auth_uid uuid;
BEGIN
  SELECT id INTO auth_uid FROM auth.users WHERE email = 'demo@gmail.com';
  
  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    username,
    email,
    role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    auth_uid,
    'demo',
    'demo@gmail.com',
    'user',
    true,
    now(),
    now()
  );
END $$;
/*
  # Create demo user

  1. Changes
    - Insert demo user with basic information
    - Password is hashed using Supabase Auth
    
  2. Security
    - User is created with basic role
    - Password is properly hashed
*/

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
    password,
    role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    auth_uid,
    'demo',
    'demo@gmail.com',
    'MANAGED_BY_SUPABASE_AUTH',
    'user',
    true,
    now(),
    now()
  );
END $$;
-- Fix RLS policies and permissions for user_llm_api_keys table
-- This migration ensures authenticated users can manage their own LLM API keys

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can view own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON user_llm_api_keys;

-- Create comprehensive RLS policies for user_llm_api_keys
-- Allow users to view their own API keys
CREATE POLICY "Users can view own API keys" ON user_llm_api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own API keys
CREATE POLICY "Users can insert own API keys" ON user_llm_api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own API keys
CREATE POLICY "Users can update own API keys" ON user_llm_api_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own API keys
CREATE POLICY "Users can delete own API keys" ON user_llm_api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON user_llm_api_keys TO authenticated;

-- Grant usage on the sequence if it exists (for auto-incrementing IDs)
-- Note: This table uses UUID with gen_random_uuid(), so no sequence needed

-- Ensure the anon role has no access (security best practice)
REVOKE ALL ON user_llm_api_keys FROM anon;

-- Add helpful comment
COMMENT ON TABLE user_llm_api_keys IS 'Stores LLM API keys for authenticated users with RLS policies ensuring users can only access their own keys';
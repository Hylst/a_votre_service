-- Fix RLS policies for user_llm_api_keys table
-- This migration ensures authenticated users can manage their own API keys

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON user_llm_api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON user_llm_api_keys;

-- Create comprehensive RLS policies for user_llm_api_keys
-- Allow authenticated users to view their own API keys
CREATE POLICY "Users can view their own API keys" ON user_llm_api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own API keys
CREATE POLICY "Users can insert their own API keys" ON user_llm_api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own API keys
CREATE POLICY "Users can update their own API keys" ON user_llm_api_keys
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own API keys
CREATE POLICY "Users can delete their own API keys" ON user_llm_api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions to authenticated and anon roles
GRANT SELECT, INSERT, UPDATE, DELETE ON user_llm_api_keys TO authenticated;
GRANT SELECT ON user_llm_api_keys TO anon;

-- Ensure RLS is enabled
ALTER TABLE user_llm_api_keys ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE user_llm_api_keys IS 'Stores LLM API keys for authenticated users with RLS policies ensuring users can only access their own keys';
-- Create table for storing Web Push notification subscriptions.
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create index for efficient user lookups.
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable Row Level Security.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions.
CREATE POLICY "Users can read own subscriptions"
ON push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscriptions.
CREATE POLICY "Users can insert own subscriptions"
ON push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions.
CREATE POLICY "Users can delete own subscriptions"
ON push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

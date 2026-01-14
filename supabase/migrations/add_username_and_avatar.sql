-- Add username and profile_picture_url to user_profiles
ALTER TABLE user_profiles
ADD COLUMN username TEXT,
ADD COLUMN profile_picture_url TEXT;

-- Add unique constraint on username
CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username)
WHERE username IS NOT NULL;

-- Auto-generate usernames for existing users
UPDATE user_profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL;

-- Handle duplicates by appending user_id suffix
WITH duplicates AS (
  SELECT username, array_agg(user_id) as user_ids
  FROM user_profiles
  GROUP BY username
  HAVING COUNT(*) > 1
)
UPDATE user_profiles up
SET username = up.username || '_' || SUBSTRING(up.user_id::text, 1, 4)
FROM duplicates d
WHERE up.username = d.username
  AND up.user_id = ANY(d.user_ids[2:]);

-- Make username NOT NULL after backfill
ALTER TABLE user_profiles
ALTER COLUMN username SET NOT NULL;

-- Create storage bucket for profile pictures (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- RLS policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

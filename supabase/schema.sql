-- Create wordle_submissions table
CREATE TABLE IF NOT EXISTS wordle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wordle_number INTEGER NOT NULL,
  guesses INTEGER NOT NULL CHECK (guesses >= 1 AND guesses <= 6),
  won BOOLEAN NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, wordle_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wordle_submissions_user_id ON wordle_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_wordle_submissions_wordle_number ON wordle_submissions(wordle_number);
CREATE INDEX IF NOT EXISTS idx_wordle_submissions_submitted_at ON wordle_submissions(submitted_at);

-- Enable Row Level Security
ALTER TABLE wordle_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all submissions (to see everyone's stats)
CREATE POLICY "Users can read all submissions"
  ON wordle_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
  ON wordle_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own submissions
CREATE POLICY "Users can update their own submissions"
  ON wordle_submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own submissions
CREATE POLICY "Users can delete their own submissions"
  ON wordle_submissions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

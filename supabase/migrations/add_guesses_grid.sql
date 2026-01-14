-- Add guesses_grid column to wordle_submissions table
ALTER TABLE wordle_submissions
ADD COLUMN guesses_grid TEXT;

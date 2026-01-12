/**
 * Calculate today's Wordle number.
 * Wordle #1 was published on June 19, 2021.
 */
export function getTodayWordleNumber(): number {
  const wordleStartDate = new Date('2021-06-19T00:00:00Z');
  const today = new Date();
  
  // Set both dates to midnight UTC for accurate day calculation
  const start = new Date(Date.UTC(
    wordleStartDate.getUTCFullYear(),
    wordleStartDate.getUTCMonth(),
    wordleStartDate.getUTCDate()
  ));
  
  const end = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  ));
  
  // Calculate difference in days
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Wordle #1 was the first day, so add 1
  return diffDays + 1;
}

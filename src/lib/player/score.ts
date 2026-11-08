// End-of-activity score text, shared by every player.

/** "7 out of 10" */
export function scoreText(correct: number, total: number): string {
  return `${correct} out of ${total}`;
}

/** A short, encouraging message for the end screen. */
export function scoreMessage(correct: number, total: number): string {
  const ratio = total > 0 ? correct / total : 0;
  if (total > 0 && correct === total) return "Perfect score! Well done.";
  if (ratio >= 0.7) return "Great work!";
  if (ratio >= 0.4) return "Good try. Play again to improve.";
  return "Keep practising. You've got this.";
}

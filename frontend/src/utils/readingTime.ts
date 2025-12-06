export function readingTime(text: string, wpm = 220): string {
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / wpm));
  return `${mins} min read`;
}

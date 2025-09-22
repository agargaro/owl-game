export function rand(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    // max = min - 1; // TODO
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = rand(i);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

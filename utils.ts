export function randomInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomEntry<T>(entries: readonly T[]): T {
  return entries[Math.floor(Math.random() * entries.length)];
}
export function isValidRegex(pattern: string): boolean {
  return /[()[\]{}|\\^$*+?]/.test(pattern);
}

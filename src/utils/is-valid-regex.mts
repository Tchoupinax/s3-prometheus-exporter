export function isValidRegex(pattern: string): boolean {
  if (pattern.includes(".*")) {
    return true;
  } else {
    return false;
  }
}

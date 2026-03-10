const HAS_LETTER = /[a-zA-Z]/;
const VALID_LABEL = /^[a-zA-Z0-9 ]+$/;

/**
 * Returns true if the value contains at least one letter.
 * Rejects strings made up entirely of numbers, special characters, or symbols.
 */
export function hasMeaningfulContent(value: string): boolean {
  return HAS_LETTER.test(value.trim());
}

/**
 * Returns true if the value contains only letters, numbers, and spaces.
 * Rejects any special characters like @, #, !, etc.
 */
export function isValidLabel(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && HAS_LETTER.test(trimmed) && VALID_LABEL.test(trimmed);
}

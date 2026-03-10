const HAS_ALPHANUMERIC = /[a-zA-Z0-9]/;

/**
 * Returns true if the value contains at least one letter or number.
 * Rejects strings made up entirely of special characters like `,,,`, `////`, `!!!`.
 */
export function hasMeaningfulContent(value: string): boolean {
  return HAS_ALPHANUMERIC.test(value.trim());
}

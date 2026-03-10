/**
 * Validation-related types.
 * Kept separate from field types to maintain single-responsibility boundaries.
 */

export interface ValidationError {
  fieldId: string;
  message: string;
}

/** Maps field IDs to their current validation error (undefined = valid). */
export type ValidationResult = Record<string, string | undefined>;

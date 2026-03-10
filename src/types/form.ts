import type { FieldConfig, FieldValue } from "./field";
import type { ConditionalRule } from "./condition";

/** Runtime form values keyed by field ID. */
export type FormValues = Record<string, FieldValue>;

/**
 * The serialisable form configuration that gets persisted.
 * Contains everything needed to reconstruct the form.
 */
export interface FormConfiguration {
  id: string;
  name: string;
  description: string;
  fields: FieldConfig[];
  conditions: ConditionalRule[];
  createdAt: string;
  updatedAt: string;
}

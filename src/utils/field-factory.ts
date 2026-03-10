import { nanoid } from "nanoid";
import type { FieldConfig, FieldType } from "@/types";
import { FieldTypes, FIELD_TYPE_LABELS } from "@/types";

/**
 * Creates a new field configuration with sensible defaults.
 * Each field type gets type-specific initial values.
 */
export function createField(type: FieldType, order: number): FieldConfig {
  const base = {
    id: nanoid(10),
    label: FIELD_TYPE_LABELS[type] + " " + (order + 1),
    placeholder: "",
    required: false,
    order,
  };

  switch (type) {
    case FieldTypes.Text:
      return { ...base, type: FieldTypes.Text, defaultValue: "" };
    case FieldTypes.Number:
      return { ...base, type: FieldTypes.Number, defaultValue: undefined };
    case FieldTypes.Select:
      return {
        ...base,
        type: FieldTypes.Select,
        options: [{ label: "Option 1", value: "option_1" }],
        defaultValue: "",
      };
    case FieldTypes.Checkbox:
      return { ...base, type: FieldTypes.Checkbox, defaultValue: false };
    case FieldTypes.Date:
      return { ...base, type: FieldTypes.Date, defaultValue: "" };
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown field type: ${_exhaustive}`);
    }
  }
}

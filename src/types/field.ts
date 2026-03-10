/**
 * Named constants for every supported field type.
 * Use these instead of raw string literals throughout the codebase.
 */
export const FieldTypes = {
  Text: "text",
  Number: "number",
  Select: "select",
  Checkbox: "checkbox",
  Date: "date",
} as const;

export type FieldType = (typeof FieldTypes)[keyof typeof FieldTypes];

export const FIELD_TYPES = Object.values(FieldTypes);

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text Input",
  number: "Number Input",
  select: "Dropdown Select",
  checkbox: "Checkbox",
  date: "Date Picker",
};

export interface SelectOption {
  label: string;
  value: string;
}

interface BaseFieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: "text";
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
  };
  defaultValue?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: "number";
  validation?: {
    min?: number;
    max?: number;
  };
  defaultValue?: number;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  options: SelectOption[];
  defaultValue?: string;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: "checkbox";
  defaultValue?: boolean;
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: "date";
  validation?: {
    minDate?: string;
    maxDate?: string;
  };
  defaultValue?: string;
}

/**
 * Discriminated union of all field configurations.
 * TypeScript narrows the type based on the `type` property.
 */
export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | DateFieldConfig;

export type FieldValue = string | number | boolean | undefined;

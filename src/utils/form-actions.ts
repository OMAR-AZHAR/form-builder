import type { FieldConfig } from "@/types";
import { FieldTypes, FIELD_TYPE_LABELS } from "@/types";
import { ToastMessages, ValidationMessages, FormLabels } from "@/constants/messages";
import { isValidLabel } from "@/utils/sanitize";

const JSON_INDENT = 2;

/**
 * Triggers a browser download of a JSON string as a file.
 */
export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Serializes data to a formatted JSON string and triggers a download.
 */
export function exportAsJsonFile(data: unknown, filename: string): void {
  downloadJson(JSON.stringify(data, null, JSON_INDENT), filename);
}

/**
 * Validates a form name. Returns an error message or null if valid.
 */
export function validateFormName(name: string): string | null {
  if (!name.trim()) return ToastMessages.formNameRequired;
  if (!isValidLabel(name))
    return ValidationMessages.noSpecialChars(FormLabels.formNameLabel);
  return null;
}

interface FieldLabelError {
  fieldId: string;
  index: number;
  message: string;
}

/**
 * Validates that every field has a meaningful label and that
 * select-type fields have valid option labels.
 * Returns the first error found, or null if all pass.
 */
export function validateFieldLabels(
  fields: FieldConfig[],
): FieldLabelError | null {
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (!f.label.trim() || !isValidLabel(f.label)) {
      return {
        fieldId: f.id,
        index: i,
        message: ToastMessages.fieldLabelInvalid(
          i + 1,
          FIELD_TYPE_LABELS[f.type],
        ),
      };
    }
    if (f.type === FieldTypes.Select) {
      const badLabel = f.options.some(
        (o) => !o.label.trim() || !isValidLabel(o.label),
      );
      if (badLabel) {
        return {
          fieldId: f.id,
          index: i,
          message: ToastMessages.optionLabelInvalid(f.label),
        };
      }
      const emptyValue = f.options.some((o) => !o.value.trim());
      if (emptyValue) {
        return {
          fieldId: f.id,
          index: i,
          message: ToastMessages.optionValueEmpty(f.label),
        };
      }
    }
  }
  return null;
}

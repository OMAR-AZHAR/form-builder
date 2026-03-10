import { memo, useCallback } from "react";
import type { FieldConfig, FieldValue } from "@/types";
import { FieldTypes } from "@/types";
import { Input, Select, Checkbox, FieldWrapper } from "@/components/ui";
import { PlaceholderTexts, FormLabels } from "@/constants/messages";
import { TEXT_MAX_LENGTH } from "@/constants/config";

interface FieldRendererProps {
  field: FieldConfig;
  value: FieldValue;
  error?: string;
  disabled?: boolean;
  onChange: (fieldId: string, value: FieldValue) => void;
}

/**
 * Renders the appropriate input control for any field type.
 * Used in both the builder's inline preview and the full preview mode.
 */
export const FieldRenderer = memo(function FieldRenderer({
  field,
  value,
  error,
  disabled = false,
  onChange,
}: FieldRendererProps) {
  const handleChange = useCallback(
    (newValue: FieldValue) => {
      onChange(field.id, newValue);
    },
    [field.id, onChange],
  );

  const inputId = `field-${field.id}`;

  switch (field.type) {
    case FieldTypes.Text:
      return (
        <FieldWrapper
          label={field.label}
          htmlFor={inputId}
          required={field.required}
          error={error}
        >
          <Input
            id={inputId}
            type="text"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => handleChange(e.target.value)}
            hasError={!!error}
            disabled={disabled}
            maxLength={TEXT_MAX_LENGTH}
          />
        </FieldWrapper>
      );

    case FieldTypes.Number:
      return (
        <FieldWrapper
          label={field.label}
          htmlFor={inputId}
          required={field.required}
          error={error}
        >
          <Input
            id={inputId}
            type="number"
            placeholder={field.placeholder}
            value={value !== undefined && value !== "" ? String(value) : ""}
            onChange={(e) => {
              const v = e.target.value;
              handleChange(v === "" ? undefined : Number(v));
            }}
            hasError={!!error}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        </FieldWrapper>
      );

    case FieldTypes.Select:
      return (
        <FieldWrapper
          label={field.label}
          htmlFor={inputId}
          required={field.required}
          error={error}
        >
          <Select
            id={inputId}
            value={String(value ?? "")}
            onChange={(e) => handleChange(e.target.value)}
            hasError={!!error}
            disabled={disabled}
          >
            <option value="">
              {field.placeholder || PlaceholderTexts.selectOption}
            </option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      );

    case FieldTypes.Checkbox:
      return (
        <FieldWrapper error={error}>
          <Checkbox
            id={inputId}
            label={field.label || FormLabels.checkboxFallbackLabel}
            checked={value === true}
            onChange={(e) => handleChange(e.target.checked)}
            hasError={!!error}
            disabled={disabled}
          />
        </FieldWrapper>
      );

    case FieldTypes.Date:
      return (
        <FieldWrapper
          label={field.label}
          htmlFor={inputId}
          required={field.required}
          error={error}
        >
          <Input
            id={inputId}
            type="date"
            value={String(value ?? "")}
            onChange={(e) => handleChange(e.target.value)}
            hasError={!!error}
            disabled={disabled}
            min={field.validation?.minDate}
            max={field.validation?.maxDate}
          />
        </FieldWrapper>
      );
  }
});

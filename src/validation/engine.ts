import type {
  FieldConfig,
  FieldValue,
  FormValues,
  ConditionalRule,
  ValidationResult,
} from "@/types";
import { FieldTypes, ConditionOperators, ConditionActions } from "@/types";
import { ValidationMessages } from "@/constants/messages";

/**
 * Evaluates whether a single condition is satisfied.
 */
function evaluateCondition(
  sourceValue: FieldValue,
  operator: string,
  expected: string | number | boolean,
): boolean {
  switch (operator) {
    case ConditionOperators.Equals:
      return String(sourceValue) === String(expected);
    case ConditionOperators.NotEquals:
      return String(sourceValue) !== String(expected);
    case ConditionOperators.Contains:
      return String(sourceValue ?? "").includes(String(expected));
    case ConditionOperators.GreaterThan:
      return Number(sourceValue) > Number(expected);
    case ConditionOperators.LessThan:
      return Number(sourceValue) < Number(expected);
    case ConditionOperators.IsChecked:
      return sourceValue === true;
    case ConditionOperators.IsNotChecked:
      return sourceValue !== true;
    default:
      return false;
  }
}

/**
 * Determines whether a conditional rule's criteria are met
 * based on current form values.
 */
export function isConditionMet(
  rule: ConditionalRule,
  values: FormValues,
): boolean {
  if (rule.conditions.length === 0) return false;

  const results = rule.conditions.map((c) =>
    evaluateCondition(values[c.sourceFieldId], c.operator, c.value),
  );

  return rule.logicOperator === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

/**
 * Resolves effective visibility for a field after evaluating all
 * show/hide conditions that target it.
 */
export function isFieldVisible(
  fieldId: string,
  conditions: ConditionalRule[],
  values: FormValues,
): boolean {
  const relevant = conditions.filter((c) => c.targetFieldId === fieldId);
  if (relevant.length === 0) return true;

  for (const rule of relevant) {
    const met = isConditionMet(rule, values);
    if (rule.action === ConditionActions.Show && !met) return false;
    if (rule.action === ConditionActions.Hide && met) return false;
  }

  return true;
}

/**
 * Resolves whether a field is effectively required after evaluating
 * both its own `required` flag and any conditional require/unrequire rules.
 */
export function isFieldRequired(
  field: FieldConfig,
  conditions: ConditionalRule[],
  values: FormValues,
): boolean {
  let required = field.required;

  const relevant = conditions.filter((c) => c.targetFieldId === field.id);
  for (const rule of relevant) {
    const met = isConditionMet(rule, values);
    if (rule.action === ConditionActions.Require && met) required = true;
    if (rule.action === ConditionActions.Unrequire && met) required = false;
  }

  return required;
}

/**
 * Validates a single field against its type-specific rules.
 * Returns an error message or undefined if valid.
 */
export function validateField(
  field: FieldConfig,
  value: FieldValue,
  conditions: ConditionalRule[],
  values: FormValues,
): string | undefined {
  if (!isFieldVisible(field.id, conditions, values)) return undefined;

  const required = isFieldRequired(field, conditions, values);
  const isEmpty =
    value === undefined || value === null || String(value).trim() === "";
  const isUncheckedBox = field.type === FieldTypes.Checkbox && value !== true;

  if (required && (isEmpty || isUncheckedBox)) {
    return ValidationMessages.required(field.label || "This field");
  }

  if (isEmpty) return undefined;

  switch (field.type) {
    case FieldTypes.Text: {
      const v = field.validation;
      if (!v) break;
      const str = String(value);
      if (v.minLength !== undefined && str.length < v.minLength) {
        return ValidationMessages.minLength(v.minLength);
      }
      if (v.maxLength !== undefined && str.length > v.maxLength) {
        return ValidationMessages.maxLength(v.maxLength);
      }
      if (v.pattern) {
        try {
          const regex = new RegExp(v.pattern);
          if (!regex.test(str)) {
            return v.patternMessage || ValidationMessages.invalidPattern;
          }
        } catch {
          return ValidationMessages.invalidPatternConfig;
        }
      }
      break;
    }

    case FieldTypes.Number: {
      const num = Number(value);
      if (isNaN(num)) return ValidationMessages.invalidNumber;
      const v = field.validation;
      if (!v) break;
      if (v.min !== undefined && num < v.min) {
        return ValidationMessages.minValue(v.min);
      }
      if (v.max !== undefined && num > v.max) {
        return ValidationMessages.maxValue(v.max);
      }
      break;
    }

    case FieldTypes.Date: {
      const v = field.validation;
      if (!v) break;
      const dateVal = new Date(String(value));
      if (isNaN(dateVal.getTime())) return ValidationMessages.invalidDate;
      if (v.minDate && dateVal < new Date(v.minDate)) {
        return ValidationMessages.minDate(v.minDate);
      }
      if (v.maxDate && dateVal > new Date(v.maxDate)) {
        return ValidationMessages.maxDate(v.maxDate);
      }
      break;
    }
  }

  return undefined;
}

/**
 * Validates every visible field in the form.
 * Returns a map of field IDs to error messages.
 */
export function validateAllFields(
  fields: FieldConfig[],
  values: FormValues,
  conditions: ConditionalRule[],
): ValidationResult {
  const result: ValidationResult = {};

  for (const field of fields) {
    result[field.id] = validateField(
      field,
      values[field.id],
      conditions,
      values,
    );
  }

  return result;
}

/**
 * Returns true when no field in the result set has an error.
 */
export function isFormValid(result: ValidationResult): boolean {
  return Object.values(result).every((err) => err === undefined);
}

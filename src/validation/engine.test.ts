import { describe, it, expect } from "vitest";
import {
  validateField,
  validateAllFields,
  isFormValid,
  isFieldVisible,
  isFieldRequired,
  isConditionMet,
} from "./engine";
import type {
  TextFieldConfig,
  NumberFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
  DateFieldConfig,
  ConditionalRule,
  FormValues,
} from "@/types";

const textField: TextFieldConfig = {
  id: "name",
  type: "text",
  label: "Name",
  required: true,
  order: 0,
  validation: {
    minLength: 2,
    maxLength: 50,
    pattern: "^[A-Za-z ]+$",
    patternMessage: "Only letters and spaces allowed",
  },
};

const numberField: NumberFieldConfig = {
  id: "age",
  type: "number",
  label: "Age",
  required: true,
  order: 1,
  validation: { min: 0, max: 150 },
};

const selectField: SelectFieldConfig = {
  id: "role",
  type: "select",
  label: "Role",
  required: false,
  order: 2,
  options: [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
  ],
};

const checkboxField: CheckboxFieldConfig = {
  id: "agree",
  type: "checkbox",
  label: "I agree",
  required: true,
  order: 3,
};

const dateField: DateFieldConfig = {
  id: "dob",
  type: "date",
  label: "Date of Birth",
  required: false,
  order: 4,
  validation: { minDate: "1900-01-01", maxDate: "2025-12-31" },
};

describe("validateField", () => {
  const noConditions: ConditionalRule[] = [];
  const emptyValues: FormValues = {};

  describe("required validation", () => {
    it("returns error when required text field is empty", () => {
      const result = validateField(textField, "", noConditions, emptyValues);
      expect(result).toContain("can't be left empty");
    });

    it("returns error when required text field is whitespace only", () => {
      const result = validateField(textField, "   ", noConditions, emptyValues);
      expect(result).toContain("can't be left empty");
    });

    it("passes when required field has a value", () => {
      const result = validateField(textField, "John", noConditions, emptyValues);
      expect(result).toBeUndefined();
    });

    it("passes when optional field is empty", () => {
      const result = validateField(selectField, "", noConditions, emptyValues);
      expect(result).toBeUndefined();
    });
  });

  describe("text validation", () => {
    it("fails when value is too short", () => {
      const result = validateField(textField, "A", noConditions, emptyValues);
      expect(result).toContain("at least 2");
    });

    it("fails when value is too long", () => {
      const result = validateField(
        textField,
        "A".repeat(51),
        noConditions,
        emptyValues,
      );
      expect(result).toContain("under 50");
    });

    it("fails when value does not match pattern", () => {
      const result = validateField(
        textField,
        "John123",
        noConditions,
        emptyValues,
      );
      expect(result).toBe("Only letters and spaces allowed");
    });

    it("passes for valid text", () => {
      const result = validateField(
        textField,
        "John Doe",
        noConditions,
        emptyValues,
      );
      expect(result).toBeUndefined();
    });
  });

  describe("number validation", () => {
    it("fails for non-numeric input", () => {
      const result = validateField(
        numberField,
        "abc" as unknown as number,
        noConditions,
        emptyValues,
      );
      expect(result).toContain("needs to be a number");
    });

    it("fails when below minimum", () => {
      const result = validateField(numberField, -1, noConditions, emptyValues);
      expect(result).toContain("0 or higher");
    });

    it("fails when above maximum", () => {
      const result = validateField(numberField, 200, noConditions, emptyValues);
      expect(result).toContain("150 or lower");
    });

    it("passes for valid number", () => {
      const result = validateField(numberField, 25, noConditions, emptyValues);
      expect(result).toBeUndefined();
    });
  });

  describe("date validation", () => {
    it("fails when date is before minimum", () => {
      const result = validateField(
        dateField,
        "1899-12-31",
        noConditions,
        emptyValues,
      );
      expect(result).toContain("on or after");
    });

    it("fails when date is after maximum", () => {
      const result = validateField(
        dateField,
        "2026-01-01",
        noConditions,
        emptyValues,
      );
      expect(result).toContain("on or before");
    });

    it("passes for valid date", () => {
      const result = validateField(
        dateField,
        "2000-06-15",
        noConditions,
        emptyValues,
      );
      expect(result).toBeUndefined();
    });
  });

  describe("checkbox validation", () => {
    it("fails when required checkbox is unchecked", () => {
      const result = validateField(
        checkboxField,
        false,
        noConditions,
        emptyValues,
      );
      expect(result).toContain("can't be left empty");
    });

    it("passes when required checkbox is checked", () => {
      const result = validateField(
        checkboxField,
        true,
        noConditions,
        emptyValues,
      );
      expect(result).toBeUndefined();
    });
  });
});

describe("conditional logic", () => {
  const showRule: ConditionalRule = {
    id: "rule1",
    targetFieldId: "age",
    action: "show",
    conditions: [{ sourceFieldId: "role", operator: "equals", value: "admin" }],
    logicOperator: "and",
  };

  const requireRule: ConditionalRule = {
    id: "rule2",
    targetFieldId: "role",
    action: "require",
    conditions: [{ sourceFieldId: "agree", operator: "is_checked", value: true }],
    logicOperator: "and",
  };

  describe("isConditionMet", () => {
    it("returns true when equals condition matches", () => {
      expect(isConditionMet(showRule, { role: "admin" })).toBe(true);
    });

    it("returns false when equals condition does not match", () => {
      expect(isConditionMet(showRule, { role: "user" })).toBe(false);
    });

    it("returns true when is_checked condition matches", () => {
      expect(isConditionMet(requireRule, { agree: true })).toBe(true);
    });

    it("returns false when is_checked condition does not match", () => {
      expect(isConditionMet(requireRule, { agree: false })).toBe(false);
    });

    it("returns false for empty conditions array", () => {
      const rule: ConditionalRule = {
        ...showRule,
        conditions: [],
      };
      expect(isConditionMet(rule, { role: "admin" })).toBe(false);
    });
  });

  describe("isFieldVisible", () => {
    it("returns true when no conditions target the field", () => {
      expect(isFieldVisible("name", [], {})).toBe(true);
    });

    it("shows field when show-condition is met", () => {
      expect(isFieldVisible("age", [showRule], { role: "admin" })).toBe(true);
    });

    it("hides field when show-condition is not met", () => {
      expect(isFieldVisible("age", [showRule], { role: "user" })).toBe(false);
    });

    it("handles hide-action correctly", () => {
      const hideRule: ConditionalRule = {
        ...showRule,
        action: "hide",
      };
      expect(isFieldVisible("age", [hideRule], { role: "admin" })).toBe(false);
      expect(isFieldVisible("age", [hideRule], { role: "user" })).toBe(true);
    });
  });

  describe("isFieldRequired", () => {
    it("returns base required when no conditions target the field", () => {
      expect(isFieldRequired(selectField, [], {})).toBe(false);
    });

    it("makes field required when require-condition is met", () => {
      expect(
        isFieldRequired(selectField, [requireRule], { agree: true }),
      ).toBe(true);
    });

    it("keeps field optional when require-condition is not met", () => {
      expect(
        isFieldRequired(selectField, [requireRule], { agree: false }),
      ).toBe(false);
    });
  });

  describe("hidden fields skip validation", () => {
    it("returns undefined for hidden required fields", () => {
      const result = validateField(numberField, undefined, [showRule], {
        role: "user",
      });
      expect(result).toBeUndefined();
    });
  });
});

describe("validateAllFields / isFormValid", () => {
  it("validates all fields and reports errors", () => {
    const fields = [textField, numberField, selectField];
    const values: FormValues = { name: "", age: 200, role: "" };
    const result = validateAllFields(fields, values, []);

    expect(result.name).toContain("can't be left empty");
    expect(result.age).toContain("150 or lower");
    expect(result.role).toBeUndefined();
    expect(isFormValid(result)).toBe(false);
  });

  it("returns all-valid when every field passes", () => {
    const fields = [textField, numberField, selectField];
    const values: FormValues = { name: "Alice", age: 30, role: "admin" };
    const result = validateAllFields(fields, values, []);

    expect(isFormValid(result)).toBe(true);
  });
});

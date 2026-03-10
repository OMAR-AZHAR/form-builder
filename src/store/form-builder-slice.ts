import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import type {
  FieldConfig,
  FieldType,
  FieldValue,
  FormValues,
  ConditionalRule,
  FormConfiguration,
  ValidationResult,
} from "@/types";
import { createField } from "@/utils/field-factory";
import {
  validateAllFields,
  validateField,
  isFormValid,
} from "@/validation/engine";
import type { AppThunk } from "./store";

interface FormBuilderState {
  formId: string;
  formName: string;
  formDescription: string;

  fields: FieldConfig[];
  conditions: ConditionalRule[];
  formValues: FormValues;
  validationErrors: ValidationResult;

  selectedFieldId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
}

function createInitialState(): FormBuilderState {
  return {
    formId: nanoid(10),
    formName: "",
    formDescription: "",
    fields: [],
    conditions: [],
    formValues: {},
    validationErrors: {},
    selectedFieldId: null,
    isDirty: false,
    isSaving: false,
    saveError: null,
    lastSavedAt: null,
  };
}

function computeDefaults(fields: readonly FieldConfig[]): FormValues {
  const defaults: FormValues = {};
  for (const f of fields) {
    if ("defaultValue" in f && f.defaultValue !== undefined) {
      defaults[f.id] = f.defaultValue as FieldValue;
    }
  }
  return defaults;
}

const formBuilderSlice = createSlice({
  name: "formBuilder",
  initialState: createInitialState(),
  reducers: {
    addField(state, action: PayloadAction<FieldType>) {
      const field = createField(action.payload, state.fields.length);
      state.fields.push(field);
      state.selectedFieldId = field.id;
      state.isDirty = true;
    },

    removeField(state, action: PayloadAction<string>) {
      const id = action.payload;
      const dependentConditions = state.conditions.filter(
        (c) =>
          c.conditions.some((fc) => fc.sourceFieldId === id) &&
          c.targetFieldId !== id,
      );

      if (dependentConditions.length > 0) {
        const targetLabels = dependentConditions
          .map((dc) => {
            const target = state.fields.find((f) => f.id === dc.targetFieldId);
            return target?.label || dc.targetFieldId;
          })
          .join(", ");

        state.saveError = `Cannot remove this field — it is referenced by conditions on: ${targetLabels}. Remove those conditions first.`;
        return;
      }

      const idx = state.fields.findIndex((f) => f.id === id);
      if (idx !== -1) state.fields.splice(idx, 1);
      state.fields.forEach((f, i) => {
        f.order = i;
      });

      state.conditions = state.conditions.filter(
        (c) =>
          c.targetFieldId !== id &&
          !c.conditions.some((fc) => fc.sourceFieldId === id),
      );

      delete state.formValues[id];
      if (state.selectedFieldId === id) state.selectedFieldId = null;
      state.isDirty = true;
      state.saveError = null;
    },

    updateField(
      state,
      action: PayloadAction<{ id: string; updates: Partial<FieldConfig> }>,
    ) {
      const { id, updates } = action.payload;
      const index = state.fields.findIndex((f) => f.id === id);
      if (index !== -1) {
        Object.assign(state.fields[index], updates);
        state.isDirty = true;
      }
    },

    reorderFields(
      state,
      action: PayloadAction<{ activeId: string; overId: string }>,
    ) {
      const { activeId, overId } = action.payload;
      const oldIndex = state.fields.findIndex((f) => f.id === activeId);
      const newIndex = state.fields.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const [moved] = state.fields.splice(oldIndex, 1);
      state.fields.splice(newIndex, 0, moved);
      state.fields.forEach((f, i) => {
        f.order = i;
      });
      state.isDirty = true;
    },

    moveField(
      state,
      action: PayloadAction<{ id: string; direction: "up" | "down" }>,
    ) {
      const { id, direction } = action.payload;
      const index = state.fields.findIndex((f) => f.id === id);
      if (index === -1) return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.fields.length) return;

      const [moved] = state.fields.splice(index, 1);
      state.fields.splice(targetIndex, 0, moved);
      state.fields.forEach((f, i) => {
        f.order = i;
      });
      state.isDirty = true;
    },

    setFormValue(
      state,
      action: PayloadAction<{ fieldId: string; value: FieldValue }>,
    ) {
      const { fieldId, value } = action.payload;
      state.formValues[fieldId] = value;
      const field = state.fields.find((f) => f.id === fieldId);
      if (field) {
        state.validationErrors[fieldId] = validateField(
          field,
          value,
          state.conditions,
          state.formValues,
        );
      }
    },

    resetFormValues(state) {
      state.formValues = computeDefaults(state.fields);
      state.validationErrors = {};
    },

    addCondition(state, action: PayloadAction<Omit<ConditionalRule, "id">>) {
      state.conditions.push({ ...action.payload, id: nanoid(10) });
      state.isDirty = true;
    },

    removeCondition(state, action: PayloadAction<string>) {
      state.conditions = state.conditions.filter(
        (c) => c.id !== action.payload,
      );
      state.isDirty = true;
    },

    updateCondition(
      state,
      action: PayloadAction<{
        ruleId: string;
        updates: Partial<ConditionalRule>;
      }>,
    ) {
      const { ruleId, updates } = action.payload;
      const index = state.conditions.findIndex((c) => c.id === ruleId);
      if (index !== -1) {
        Object.assign(state.conditions[index], updates);
        state.isDirty = true;
      }
    },

    selectField(state, action: PayloadAction<string | null>) {
      state.selectedFieldId = action.payload;
    },

    setFormName(state, action: PayloadAction<string>) {
      state.formName = action.payload;
      state.isDirty = true;
    },

    setFormDescription(state, action: PayloadAction<string>) {
      state.formDescription = action.payload;
      state.isDirty = true;
    },

    setValidationErrors(state, action: PayloadAction<ValidationResult>) {
      state.validationErrors = action.payload;
    },

    validateSingleField(state, action: PayloadAction<string>) {
      const field = state.fields.find((f) => f.id === action.payload);
      if (!field) return;
      state.validationErrors[action.payload] = validateField(
        field,
        state.formValues[action.payload],
        state.conditions,
        state.formValues,
      );
    },

    clearValidation(state) {
      state.validationErrors = {};
    },

    loadFormConfiguration(state, action: PayloadAction<FormConfiguration>) {
      const config = action.payload;
      state.formId = config.id;
      state.formName = config.name;
      state.formDescription = config.description;
      state.fields = config.fields;
      state.conditions = config.conditions;
      state.formValues = computeDefaults(config.fields);
      state.validationErrors = {};
      state.selectedFieldId = null;
      state.isDirty = false;
      state.saveError = null;
    },

    resetForm() {
      return createInitialState();
    },

    setSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },

    setSaveError(state, action: PayloadAction<string | null>) {
      state.saveError = action.payload;
    },

    setLastSavedAt(state, action: PayloadAction<string | null>) {
      state.lastSavedAt = action.payload;
    },

    markClean(state) {
      state.isDirty = false;
    },
  },
});

// ---------------------------------------------------------------------------
// Thunks — imperative actions that need to read state and return a value
// ---------------------------------------------------------------------------

export const validateFormThunk =
  (): AppThunk<boolean> => (dispatch, getState) => {
    const { fields, formValues, conditions } = getState().formBuilder;
    const result = validateAllFields(fields, formValues, conditions);
    dispatch(formBuilderSlice.actions.setValidationErrors(result));
    return isFormValid(result);
  };

export const getFormConfigThunk =
  (): AppThunk<FormConfiguration> => (_dispatch, getState) => {
    const { formId, formName, formDescription, fields, conditions } =
      getState().formBuilder;
    return {
      id: formId,
      name: formName || "Untitled Form",
      description: formDescription,
      fields,
      conditions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const {
  addField,
  removeField,
  updateField,
  reorderFields,
  moveField,
  setFormValue,
  resetFormValues,
  addCondition,
  removeCondition,
  updateCondition,
  selectField,
  setFormName,
  setFormDescription,
  setValidationErrors,
  validateSingleField,
  clearValidation,
  loadFormConfiguration,
  resetForm,
  setSaving,
  setSaveError,
  setLastSavedAt,
  markClean,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;

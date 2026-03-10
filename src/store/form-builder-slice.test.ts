import { describe, it, expect, beforeEach } from "vitest";
import { createTestStore } from "./store";
import {
  addField,
  removeField,
  updateField,
  reorderFields,
  setFormValue,
  addCondition,
  removeCondition,
  setFormName,
  loadFormConfiguration,
  validateFormThunk,
  getFormConfigThunk,
} from "./form-builder-slice";

type TestStore = ReturnType<typeof createTestStore>;

describe("FormBuilderSlice", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  const fb = () => store.getState().formBuilder;

  describe("field management", () => {
    it("adds a field and selects it", () => {
      store.dispatch(addField("text"));

      expect(fb().fields).toHaveLength(1);
      expect(fb().fields[0].type).toBe("text");
      expect(fb().selectedFieldId).toBe(fb().fields[0].id);
      expect(fb().isDirty).toBe(true);
    });

    it("removes a field and cleans up selection", () => {
      store.dispatch(addField("text"));
      const fieldId = fb().fields[0].id;
      store.dispatch(removeField(fieldId));

      expect(fb().fields).toHaveLength(0);
      expect(fb().selectedFieldId).toBeNull();
    });

    it("updates a field's properties", () => {
      store.dispatch(addField("text"));
      const fieldId = fb().fields[0].id;
      store.dispatch(updateField({ id: fieldId, updates: { label: "Email" } }));

      expect(fb().fields[0].label).toBe("Email");
    });

    it("reorders fields correctly", () => {
      store.dispatch(addField("text"));
      store.dispatch(addField("number"));
      store.dispatch(addField("checkbox"));

      const ids = fb().fields.map((f) => f.id);
      store.dispatch(reorderFields({ activeId: ids[2], overId: ids[0] }));

      const reordered = fb().fields;
      expect(reordered[0].id).toBe(ids[2]);
      expect(reordered[1].id).toBe(ids[0]);
      expect(reordered[2].id).toBe(ids[1]);
      expect(reordered.every((f, i) => f.order === i)).toBe(true);
    });

    it("prevents removing a field referenced in another field's condition", () => {
      store.dispatch(addField("select"));
      store.dispatch(addField("text"));

      const [selectF, textF] = fb().fields;

      store.dispatch(
        addCondition({
          targetFieldId: textF.id,
          action: "show",
          conditions: [
            { sourceFieldId: selectF.id, operator: "equals", value: "yes" },
          ],
          logicOperator: "and",
        }),
      );

      store.dispatch(removeField(selectF.id));

      expect(fb().fields).toHaveLength(2);
      expect(fb().saveError).toBeTruthy();
    });
  });

  describe("conditional rules", () => {
    it("adds and removes conditional rules", () => {
      store.dispatch(addField("checkbox"));
      store.dispatch(addField("text"));

      const [cb, text] = fb().fields;

      store.dispatch(
        addCondition({
          targetFieldId: text.id,
          action: "show",
          conditions: [
            { sourceFieldId: cb.id, operator: "is_checked", value: true },
          ],
          logicOperator: "and",
        }),
      );

      expect(fb().conditions).toHaveLength(1);

      const ruleId = fb().conditions[0].id;
      store.dispatch(removeCondition(ruleId));

      expect(fb().conditions).toHaveLength(0);
    });
  });

  describe("form values and validation", () => {
    it("sets form values with real-time validation", () => {
      store.dispatch(addField("text"));
      const fieldId = fb().fields[0].id;
      store.dispatch(
        updateField({
          id: fieldId,
          updates: { label: "Name", required: true },
        }),
      );

      store.dispatch(setFormValue({ fieldId, value: "" }));
      expect(fb().validationErrors[fieldId]).toBeTruthy();

      store.dispatch(setFormValue({ fieldId, value: "Alice" }));
      expect(fb().validationErrors[fieldId]).toBeUndefined();
    });

    it("validateForm returns false when errors exist", () => {
      store.dispatch(addField("text"));
      const fieldId = fb().fields[0].id;
      store.dispatch(
        updateField({
          id: fieldId,
          updates: { label: "Name", required: true },
        }),
      );

      const valid = store.dispatch(validateFormThunk());
      expect(valid).toBe(false);
    });
  });

  describe("form configuration", () => {
    it("exports and re-imports a configuration", () => {
      store.dispatch(addField("text"));
      store.dispatch(addField("number"));
      store.dispatch(setFormName("Test Form"));

      const config = store.dispatch(getFormConfigThunk());
      expect(config.name).toBe("Test Form");
      expect(config.fields).toHaveLength(2);

      store.dispatch(
        loadFormConfiguration({
          ...config,
          name: "Reloaded Form",
        }),
      );

      expect(fb().formName).toBe("Reloaded Form");
      expect(fb().fields).toHaveLength(2);
      expect(fb().isDirty).toBe(false);
    });
  });

});

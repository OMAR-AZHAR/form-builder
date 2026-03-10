import { memo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addField,
  removeField,
  updateField,
  reorderFields,
  moveField,
  setFormValue,
  addCondition,
  removeCondition,
  selectField,
  setFormName,
  setFormDescription,
  loadFormConfiguration,
  resetForm,
  setSaving,
  setSaveError,
  setLastSavedAt,
  markClean,
  validateFormThunk,
  getFormConfigThunk,
} from "@/store/form-builder-slice";
import { formApi } from "@/api/mock-api";
import { ToastMessages, ValidationMessages, FormLabels, ButtonLabels } from "@/constants/messages";
import { TEXT_MAX_LENGTH } from "@/constants/config";
import { hasMeaningfulContent } from "@/utils/sanitize";
import type {
  FieldType,
  FieldValue,
  FieldConfig,
  ConditionalRule,
  FormConfiguration,
} from "@/types";
import { FIELD_TYPE_LABELS } from "@/types";
import { FieldTypeSelector } from "./FieldTypeSelector";
import { FieldConfigurator } from "./FieldConfigurator";
import { ConditionalEditor } from "./ConditionalEditor";
import { SavedFormsList } from "./SavedFormsList";
import { FormPreview } from "@/components/preview/FormPreview";
import { Input, Button, FieldWrapper } from "@/components/ui";
import {
  Save,
  Download,
  FilePlus,
  AlertCircle,
} from "lucide-react";

interface FormBuilderProps {
  onToast: (type: "success" | "error" | "info", message: string) => void;
}

export const FormBuilder = memo(function FormBuilder({
  onToast,
}: FormBuilderProps) {
  const dispatch = useAppDispatch();
  const {
    fields,
    conditions,
    formValues,
    validationErrors,
    selectedFieldId,
    isSaving,
    saveError,
    lastSavedAt,
    formName,
    formDescription,
  } = useAppSelector((s) => s.formBuilder);

  const [savedFormsKey, setSavedFormsKey] = useState(0);
  const [formNameError, setFormNameError] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const selectedFieldIndex = selectedField
    ? fields.findIndex((f) => f.id === selectedField.id)
    : -1;

  const validateFormName = useCallback((): boolean => {
    if (!formName.trim()) {
      setFormNameError(ToastMessages.formNameRequired);
      onToast("error", ToastMessages.formNameRequired);
      return false;
    }
    if (!hasMeaningfulContent(formName)) {
      const msg = ValidationMessages.meaningfulText("Form name");
      setFormNameError(msg);
      onToast("error", msg);
      return false;
    }
    setFormNameError(null);
    return true;
  }, [formName, onToast]);

  const handleAddField = useCallback(
    (type: FieldType) => {
      if (!validateFormName()) return;
      dispatch(addField(type));
      setIsViewMode(false);
    },
    [dispatch, validateFormName],
  );

  const handleSave = useCallback(async () => {
    if (!validateFormName()) return;
    if (fields.length === 0) {
      onToast("error", ToastMessages.noFields);
      return;
    }

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (!f.label.trim() || !hasMeaningfulContent(f.label)) {
        onToast("error", ToastMessages.fieldLabelInvalid(i + 1, FIELD_TYPE_LABELS[f.type]));
        dispatch(selectField(f.id));
        return;
      }
      if (f.type === "select") {
        const badOption = f.options.some(
          (o) => !o.label.trim() || !hasMeaningfulContent(o.label),
        );
        if (badOption) {
          onToast("error", ToastMessages.optionLabelInvalid(f.label));
          dispatch(selectField(f.id));
          return;
        }
      }
    }

    dispatch(setSaving(true));
    dispatch(setSaveError(null));

    try {
      const config = dispatch(getFormConfigThunk());
      await formApi.save(config);
      dispatch(setLastSavedAt(new Date().toISOString()));
      dispatch(markClean());
      setSavedFormsKey((k) => k + 1);
      onToast("success", ToastMessages.saveSuccess);
    } catch {
      dispatch(setSaveError(ToastMessages.saveFailed));
      onToast("error", ToastMessages.saveFailed);
    } finally {
      dispatch(setSaving(false));
    }
  }, [dispatch, fields, validateFormName, onToast]);

  const handleExport = useCallback(async () => {
    try {
      const config = dispatch(getFormConfigThunk());
      const json = await formApi.exportAsJson(config);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.name || "form"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onToast("success", ToastMessages.exportSuccess);
    } catch {
      onToast("error", ToastMessages.exportFailed);
    }
  }, [dispatch, onToast]);

  const handleLoadForm = useCallback(
    (config: FormConfiguration) => {
      dispatch(loadFormConfiguration(config));
      setIsViewMode(true);
      onToast("info", `Loaded "${config.name}"`);
    },
    [dispatch, onToast],
  );

  const handleEditForm = useCallback(
    (config: FormConfiguration) => {
      dispatch(loadFormConfiguration(config));
      setIsViewMode(false);
      onToast("info", `Editing "${config.name}"`);
    },
    [dispatch, onToast],
  );

  const handlePreviewSubmit = useCallback(async () => {
    const isValid = dispatch(validateFormThunk());
    if (!isValid) {
      onToast("error", ToastMessages.submitInvalid);
      return;
    }

    try {
      const config = dispatch(getFormConfigThunk());
      await formApi.submitForm(config.id, formValues);
      onToast("success", ToastMessages.submitSuccess);
    } catch {
      onToast("error", ToastMessages.saveFailed);
    }
  }, [dispatch, formValues, onToast]);

  const handleFieldChange = useCallback(
    (fieldId: string, value: FieldValue) =>
      dispatch(setFormValue({ fieldId, value })),
    [dispatch],
  );

  const handleAddCondition = useCallback(
    (rule: Omit<ConditionalRule, "id">) => dispatch(addCondition(rule)),
    [dispatch],
  );

  const handleRemoveCondition = useCallback(
    (ruleId: string) => dispatch(removeCondition(ruleId)),
    [dispatch],
  );

  const handleSelectField = useCallback(
    (id: string | null) => dispatch(selectField(id)),
    [dispatch],
  );

  const handleRemoveField = useCallback(
    (id: string) => dispatch(removeField(id)),
    [dispatch],
  );

  const handleUpdateField = useCallback(
    (id: string, updates: Partial<FieldConfig>) =>
      dispatch(updateField({ id, updates })),
    [dispatch],
  );

  const handleReorderFields = useCallback(
    (activeId: string, overId: string) =>
      dispatch(reorderFields({ activeId, overId })),
    [dispatch],
  );

  const handleMoveUp = useCallback(
    (id: string) => dispatch(moveField({ id, direction: "up" })),
    [dispatch],
  );

  const handleMoveDown = useCallback(
    (id: string) => dispatch(moveField({ id, direction: "down" })),
    [dispatch],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-0">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0 space-y-6 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto scrollbar-thin lg:pr-2">
        <FieldTypeSelector onSelect={handleAddField} />

        <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
          <ConditionalEditor
            fields={fields}
            conditions={conditions}
            onAdd={handleAddCondition}
            onRemove={handleRemoveCondition}
          />
        </div>

        <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
          <SavedFormsList
            onLoad={handleLoadForm}
            onEdit={handleEditForm}
            onToast={onToast}
            refreshKey={savedFormsKey}
          />
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 min-w-0 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
          <FieldWrapper error={formNameError ?? undefined} className="sm:flex-1">
            <Input
              value={formName?.toString().trimStart()}
              onChange={(e) => {
                dispatch(setFormName(e.target.value));
                if (formNameError && e.target.value.trim()) setFormNameError(null);
              }}
              placeholder={FormLabels.formNamePlaceholder}
              hasError={!!formNameError}
              maxLength={TEXT_MAX_LENGTH}
              className="text-lg font-semibold"
              aria-required="true"
            />
          </FieldWrapper>
          <Input
            value={formDescription}
            onChange={(e) => dispatch(setFormDescription(e.target.value))}
            placeholder={FormLabels.descriptionPlaceholder}
            maxLength={TEXT_MAX_LENGTH}
            className="sm:flex-1"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="h-3.5 w-3.5" />}
            onClick={handleSave}
            loading={isSaving}
            disabled={fields.length === 0}
          >
            {ButtonLabels.save}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={handleExport}
            disabled={fields.length === 0}
          >
            {ButtonLabels.exportJson}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<FilePlus className="h-3.5 w-3.5" />}
            onClick={() => {
              dispatch(resetForm());
              setIsViewMode(false);
            }}
          >
            {ButtonLabels.newForm}
          </Button>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 rounded-lg border border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-500/10 px-4 py-3 text-sm text-danger-700 dark:text-danger-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{saveError}</p>
            <button
              onClick={() => dispatch(setSaveError(null))}
              className="ml-auto text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300 text-xs font-medium"
            >
              {ButtonLabels.dismiss}
            </button>
          </div>
        )}

        <FormPreview
          formName={formName}
          formDescription={formDescription}
          fields={fields}
          conditions={conditions}
          formValues={formValues}
          validationErrors={validationErrors}
          selectedFieldId={selectedFieldId}
          isEditing={!isViewMode}
          onFieldChange={handleFieldChange}
          onFieldSelect={handleSelectField}
          onReorder={handleReorderFields}
          onSubmit={handlePreviewSubmit}
        />

        {lastSavedAt && (
          <p className="text-xs text-surface-500 dark:text-surface-400 text-right">
            {FormLabels.lastSaved}{" "}
            {new Date(lastSavedAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </main>

      {/* Config panel — only in editing mode */}
      {!isViewMode && selectedField && (
        <aside className="w-full lg:w-72 shrink-0 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/30 p-4 sm:p-5 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto scrollbar-thin">
          <FieldConfigurator
            key={selectedField.id}
            field={selectedField}
            isFirst={selectedFieldIndex === 0}
            isLast={selectedFieldIndex === fields.length - 1}
            onUpdate={handleUpdateField}
            onRemove={handleRemoveField}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onClose={() => handleSelectField(null)}
          />
        </aside>
      )}
    </div>
  );
});

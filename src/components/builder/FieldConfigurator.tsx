import { memo, useCallback } from "react";
import type { FieldConfig, SelectOption } from "@/types";
import { FieldTypes } from "@/types";
import { Input, Checkbox, FieldWrapper, Button } from "@/components/ui";
import {
  SectionLabels,
  FieldConfigLabels,
  PlaceholderTexts,
  ButtonLabels,
  AriaLabels,
} from "@/constants/messages";
import { TEXT_MAX_LENGTH } from "@/constants/config";
import { isValidLabel } from "@/utils/sanitize";
import { Trash2, Plus, X, ArrowUp, ArrowDown } from "lucide-react";

interface FieldConfiguratorProps {
  field: FieldConfig;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (id: string, updates: Partial<FieldConfig>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onClose: () => void;
}

export const FieldConfigurator = memo(function FieldConfigurator({
  field,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClose,
}: FieldConfiguratorProps) {
  const update = useCallback(
    (updates: Partial<FieldConfig>) => {
      onUpdate(field.id, updates);
    },
    [field.id, onUpdate],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
          {SectionLabels.configureField}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 dark:hover:text-surface-300"
          aria-label={AriaLabels.closeConfigurator}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <FieldWrapper label={FieldConfigLabels.label} htmlFor="cfg-label">
        <Input
          id="cfg-label"
          value={field.label.trimStart()}
          onChange={(e) => update({ label: e.target.value })}
          placeholder={PlaceholderTexts.enterFieldLabel}
          hasError={field.label.trim().length > 0 && !isValidLabel(field.label)}
          maxLength={TEXT_MAX_LENGTH}
        />
      </FieldWrapper>

      {field.type !== FieldTypes.Checkbox && (
        <FieldWrapper label={FieldConfigLabels.placeholder} htmlFor="cfg-placeholder">
          <Input
            id="cfg-placeholder"
            value={field.placeholder ?? ""}
            onChange={(e) => update({ placeholder: e.target.value })}
            placeholder={PlaceholderTexts.enterPlaceholderText}
            maxLength={TEXT_MAX_LENGTH}
          />
        </FieldWrapper>
      )}

      <Checkbox
        id="cfg-required"
        label={FieldConfigLabels.required}
        checked={field.required}
        onChange={(e) => update({ required: e.target.checked })}
      />

      {field.type === FieldTypes.Text && <TextValidation field={field} onUpdate={update} />}
      {field.type === FieldTypes.Number && <NumberValidation field={field} onUpdate={update} />}
      {field.type === FieldTypes.Date && <DateValidation field={field} onUpdate={update} />}
      {field.type === FieldTypes.Select && <SelectOptions field={field} onUpdate={update} />}

      <div className="pt-3 border-t border-surface-200 dark:border-surface-700 space-y-3">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            onClick={() => onMoveUp(field.id)}
            disabled={isFirst}
          >
            {ButtonLabels.moveUp}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            onClick={() => onMoveDown(field.id)}
            disabled={isLast}
          >
            {ButtonLabels.moveDown}
          </Button>
        </div>
        <Button
          variant="danger"
          size="sm"
          icon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={() => onRemove(field.id)}
        >
          {ButtonLabels.removeField}
        </Button>
      </div>
    </div>
  );
});

function TextValidation({
  field,
  onUpdate,
}: {
  field: Extract<FieldConfig, { type: "text" }>;
  onUpdate: (u: Partial<FieldConfig>) => void;
}) {
  const v = field.validation ?? {};

  const setValidation = (patch: Partial<typeof v>) => {
    onUpdate({ validation: { ...v, ...patch } } as Partial<FieldConfig>);
  };

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300">
        {SectionLabels.textValidation}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label={FieldConfigLabels.minLength} htmlFor="cfg-minlen">
          <Input
            id="cfg-minlen"
            type="number"
            min={0}
            value={v.minLength ?? ""}
            onChange={(e) =>
              setValidation({
                minLength: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </FieldWrapper>
        <FieldWrapper label={FieldConfigLabels.maxLength} htmlFor="cfg-maxlen">
          <Input
            id="cfg-maxlen"
            type="number"
            min={0}
            value={v.maxLength ?? ""}
            onChange={(e) =>
              setValidation({
                maxLength: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </FieldWrapper>
      </div>
      <FieldWrapper label={FieldConfigLabels.regexPattern} htmlFor="cfg-pattern">
        <Input
          id="cfg-pattern"
          value={v.pattern ?? ""}
          onChange={(e) => setValidation({ pattern: e.target.value || undefined })}
          placeholder={PlaceholderTexts.regexExample}
          maxLength={TEXT_MAX_LENGTH}
        />
      </FieldWrapper>
      <FieldWrapper label={FieldConfigLabels.patternErrorMessage} htmlFor="cfg-patmsg">
        <Input
          id="cfg-patmsg"
          value={v.patternMessage ?? ""}
          onChange={(e) =>
            setValidation({ patternMessage: e.target.value || undefined })
          }
          placeholder={PlaceholderTexts.customPatternMessage}
          maxLength={TEXT_MAX_LENGTH}
        />
      </FieldWrapper>
    </div>
  );
}

function NumberValidation({
  field,
  onUpdate,
}: {
  field: Extract<FieldConfig, { type: "number" }>;
  onUpdate: (u: Partial<FieldConfig>) => void;
}) {
  const v = field.validation ?? {};

  const setValidation = (patch: Partial<typeof v>) => {
    onUpdate({ validation: { ...v, ...patch } } as Partial<FieldConfig>);
  };

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300">
        {SectionLabels.numberValidation}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label={FieldConfigLabels.minValue} htmlFor="cfg-min">
          <Input
            id="cfg-min"
            type="number"
            value={v.min ?? ""}
            onChange={(e) =>
              setValidation({
                min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </FieldWrapper>
        <FieldWrapper label={FieldConfigLabels.maxValue} htmlFor="cfg-max">
          <Input
            id="cfg-max"
            type="number"
            value={v.max ?? ""}
            onChange={(e) =>
              setValidation({
                max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </FieldWrapper>
      </div>
    </div>
  );
}

function DateValidation({
  field,
  onUpdate,
}: {
  field: Extract<FieldConfig, { type: "date" }>;
  onUpdate: (u: Partial<FieldConfig>) => void;
}) {
  const v = field.validation ?? {};

  const setValidation = (patch: Partial<typeof v>) => {
    onUpdate({ validation: { ...v, ...patch } } as Partial<FieldConfig>);
  };

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300">
        {SectionLabels.dateValidation}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label={FieldConfigLabels.earliestDate} htmlFor="cfg-mindate">
          <Input
            id="cfg-mindate"
            type="date"
            value={v.minDate ?? ""}
            onChange={(e) =>
              setValidation({ minDate: e.target.value || undefined })
            }
          />
        </FieldWrapper>
        <FieldWrapper label={FieldConfigLabels.latestDate} htmlFor="cfg-maxdate">
          <Input
            id="cfg-maxdate"
            type="date"
            value={v.maxDate ?? ""}
            onChange={(e) =>
              setValidation({ maxDate: e.target.value || undefined })
            }
          />
        </FieldWrapper>
      </div>
    </div>
  );
}

function SelectOptions({
  field,
  onUpdate,
}: {
  field: Extract<FieldConfig, { type: "select" }>;
  onUpdate: (u: Partial<FieldConfig>) => void;
}) {
  const addOption = () => {
    const next: SelectOption[] = [
      ...field.options,
      {
        label: `Option ${field.options.length + 1}`,
        value: `option_${field.options.length + 1}`,
      },
    ];
    onUpdate({ options: next } as Partial<FieldConfig>);
  };

  const updateOption = (index: number, patch: Partial<SelectOption>) => {
    const next = field.options.map((o, i) =>
      i === index ? { ...o, ...patch } : o,
    );
    onUpdate({ options: next } as Partial<FieldConfig>);
  };

  const removeOption = (index: number) => {
    if (field.options.length <= 1) return;
    onUpdate({
      options: field.options.filter((_, i) => i !== index),
    } as Partial<FieldConfig>);
  };

  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300">
        {SectionLabels.options}
      </p>
      {field.options.map((opt, i) => (
        <div key={opt.value || i} className="flex items-center gap-2">
          <Input
            value={opt.label.trimStart()}
            onChange={(e) => updateOption(i, { label: e.target.value })}
            placeholder={PlaceholderTexts.optionLabel}
            hasError={!isValidLabel(opt.label)}
            maxLength={TEXT_MAX_LENGTH}
            className="flex-1"
          />
          <Input
            value={opt.value.trimStart()}
            onChange={(e) => updateOption(i, { value: e.target.value })}
            placeholder={PlaceholderTexts.optionValue}
            hasError={!opt.value.trim()}
            maxLength={TEXT_MAX_LENGTH}
            className="flex-1"
          />
          <button
            onClick={() => removeOption(i)}
            disabled={field.options.length <= 1}
            className="p-1.5 rounded-md text-surface-400 hover:text-danger-500 hover:bg-danger-50 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-danger-500/10"
            aria-label={AriaLabels.removeOption}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        icon={<Plus className="h-3.5 w-3.5" />}
        onClick={addOption}
      >
        {ButtonLabels.addOption}
      </Button>
    </div>
  );
}

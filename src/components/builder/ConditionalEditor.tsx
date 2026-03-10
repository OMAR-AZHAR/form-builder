import { memo, useState, useCallback } from "react";
import type {
  FieldConfig,
  ConditionalRule,
  ConditionAction,
  ConditionOperator,
  FieldCondition,
} from "@/types";
import {
  FieldTypes,
  ConditionOperators,
  ConditionActions,
  CONDITION_ACTIONS,
  CONDITION_ACTION_LABELS,
  CONDITION_OPERATORS,
  CONDITION_OPERATOR_LABELS,
} from "@/types";
import { Button, Select, Input, FieldWrapper } from "@/components/ui";
import {
  SectionLabels,
  FieldConfigLabels,
  PlaceholderTexts,
  ButtonLabels,
  EmptyStateTexts,
  AriaLabels,
} from "@/constants/messages";
import { TEXT_MAX_LENGTH } from "@/constants/config";
import { Plus, Trash2, GitBranch } from "lucide-react";

interface ConditionalEditorProps {
  fields: FieldConfig[];
  conditions: ConditionalRule[];
  onAdd: (rule: Omit<ConditionalRule, "id">) => void;
  onRemove: (ruleId: string) => void;
}

const EMPTY_CONDITION: FieldCondition = {
  sourceFieldId: "",
  operator: ConditionOperators.Equals,
  value: "",
};

export const ConditionalEditor = memo(function ConditionalEditor({
  fields,
  conditions,
  onAdd,
  onRemove,
}: ConditionalEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<ConditionalRule, "id">>({
    targetFieldId: "",
    action: ConditionActions.Show,
    conditions: [{ ...EMPTY_CONDITION }],
    logicOperator: "and",
  });

  const resetDraft = useCallback(() => {
    setDraft({
      targetFieldId: "",
      action: ConditionActions.Show,
      conditions: [{ ...EMPTY_CONDITION }],
      logicOperator: "and",
    });
    setIsAdding(false);
  }, []);

  const canSave =
    draft.targetFieldId &&
    draft.conditions.length > 0 &&
    draft.conditions.every(
      (c) =>
        c.sourceFieldId &&
        c.sourceFieldId !== draft.targetFieldId &&
        (c.operator === ConditionOperators.IsChecked ||
          c.operator === ConditionOperators.IsNotChecked ||
          String(c.value).trim() !== ""),
    );

  const handleSave = () => {
    if (!canSave) return;
    onAdd(draft);
    resetDraft();
  };

  const updateDraftCondition = (
    index: number,
    patch: Partial<FieldCondition>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    }));
  };

  const getSourceFieldForCondition = (condition: FieldCondition) => {
    return fields.find((f) => f.id === condition.sourceFieldId);
  };

  const getOperatorsForField = (field: FieldConfig | undefined) => {
    if (!field) return CONDITION_OPERATORS;
    if (field.type === FieldTypes.Checkbox) {
      return [
        ConditionOperators.IsChecked,
        ConditionOperators.IsNotChecked,
      ] as ConditionOperator[];
    }
    if (field.type === FieldTypes.Number) {
      return [
        ConditionOperators.Equals,
        ConditionOperators.NotEquals,
        ConditionOperators.GreaterThan,
        ConditionOperators.LessThan,
      ] as ConditionOperator[];
    }
    return [
      ConditionOperators.Equals,
      ConditionOperators.NotEquals,
      ConditionOperators.Contains,
    ] as ConditionOperator[];
  };

  const needsValueInput = (operator: ConditionOperator) =>
    operator !== ConditionOperators.IsChecked &&
    operator !== ConditionOperators.IsNotChecked;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300">
          {SectionLabels.conditionalRules}
        </h3>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setIsAdding(true)}
            disabled={fields.length < 2}
          >
            {ButtonLabels.addRule}
          </Button>
        )}
      </div>

      {conditions.length === 0 && !isAdding && (
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {EmptyStateTexts.noRulesDescription}
        </p>
      )}

      {conditions.map((rule) => {
        const target = fields.find((f) => f.id === rule.targetFieldId);
        return (
          <div
            key={rule.id}
            className="rounded-lg border border-surface-200 dark:border-surface-700 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs text-surface-600 dark:text-surface-400 space-y-1">
                <p>
                  <span className="font-medium">
                    {CONDITION_ACTION_LABELS[rule.action]}
                  </span>{" "}
                  &ldquo;{target?.label || rule.targetFieldId}&rdquo;
                </p>
                <p className="text-surface-500 dark:text-surface-400">
                  when{" "}
                  {rule.conditions
                    .map((c) => {
                      const src = fields.find(
                        (f) => f.id === c.sourceFieldId,
                      );
                      return `"${src?.label || c.sourceFieldId}" ${CONDITION_OPERATOR_LABELS[c.operator]}${needsValueInput(c.operator) ? ` "${c.value}"` : ""}`;
                    })
                    .join(rule.logicOperator === "and" ? " AND " : " OR ")}
                </p>
              </div>
              <button
                onClick={() => onRemove(rule.id)}
                className="p-1 rounded text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 shrink-0"
                aria-label={AriaLabels.removeRule}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      {isAdding && (
        <div className="rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 p-4 space-y-4">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <GitBranch className="h-4 w-4" />
            <span className="text-sm font-medium">{SectionLabels.newConditionalRule}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldWrapper label={FieldConfigLabels.action}>
              <Select
                value={draft.action}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    action: e.target.value as ConditionAction,
                  }))
                }
              >
                {CONDITION_ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {CONDITION_ACTION_LABELS[a]}
                  </option>
                ))}
              </Select>
            </FieldWrapper>

            <FieldWrapper label={FieldConfigLabels.targetField}>
              <Select
                value={draft.targetFieldId}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, targetFieldId: e.target.value }))
                }
              >
                <option value="">{PlaceholderTexts.selectField}</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label || `Untitled (${f.type})`}
                  </option>
                ))}
              </Select>
            </FieldWrapper>
          </div>

          {draft.conditions.length > 1 && (
            <FieldWrapper label={FieldConfigLabels.match}>
              <Select
                value={draft.logicOperator}
                onChange={(e) =>
                  setDraft((p) => ({
                    ...p,
                    logicOperator: e.target.value as "and" | "or",
                  }))
                }
              >
                <option value="and">{PlaceholderTexts.allConditionsAnd}</option>
                <option value="or">{PlaceholderTexts.anyConditionOr}</option>
              </Select>
            </FieldWrapper>
          )}

          {draft.conditions.map((cond, i) => {
            const sourceField = getSourceFieldForCondition(cond);
            const operators = getOperatorsForField(sourceField);

            return (
              <div
                key={i}
                className="flex items-end gap-2 flex-wrap"
              >
                <FieldWrapper label={FieldConfigLabels.when} className="flex-1 min-w-[140px]">
                  <Select
                    value={cond.sourceFieldId}
                    onChange={(e) =>
                      updateDraftCondition(i, {
                        sourceFieldId: e.target.value,
                        operator: ConditionOperators.Equals,
                        value: "",
                      })
                    }
                  >
                    <option value="">{PlaceholderTexts.selectField}</option>
                    {fields
                      .filter((f) => f.id !== draft.targetFieldId)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label || `Untitled (${f.type})`}
                        </option>
                      ))}
                  </Select>
                </FieldWrapper>

                <FieldWrapper label={FieldConfigLabels.operator} className="flex-1 min-w-[140px]">
                  <Select
                    value={cond.operator}
                    onChange={(e) =>
                      updateDraftCondition(i, {
                        operator: e.target.value as ConditionOperator,
                      })
                    }
                  >
                    {operators.map((op) => (
                      <option key={op} value={op}>
                        {CONDITION_OPERATOR_LABELS[op]}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>

                {needsValueInput(cond.operator) && (
                  <FieldWrapper label={FieldConfigLabels.value} className="flex-1 min-w-[100px]">
                    {sourceField?.type === FieldTypes.Select ? (
                      <Select
                        value={String(cond.value)}
                        onChange={(e) =>
                          updateDraftCondition(i, { value: e.target.value })
                        }
                      >
                        <option value="">{PlaceholderTexts.selectValue}</option>
                        {sourceField.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type={sourceField?.type === FieldTypes.Number ? "number" : "text"}
                        value={String(cond.value)}
                        onChange={(e) =>
                          updateDraftCondition(i, {
                            value:
                              sourceField?.type === FieldTypes.Number
                                ? Number(e.target.value)
                                : e.target.value,
                          })
                        }
                        placeholder={PlaceholderTexts.enterValue}
                        maxLength={TEXT_MAX_LENGTH}
                      />
                    )}
                  </FieldWrapper>
                )}

                {draft.conditions.length > 1 && (
                  <button
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        conditions: p.conditions.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-2 mb-0.5 rounded text-surface-400 hover:text-danger-500"
                    aria-label={AriaLabels.removeCondition}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() =>
              setDraft((p) => ({
                ...p,
                conditions: [...p.conditions, { ...EMPTY_CONDITION }],
              }))
            }
          >
            {ButtonLabels.addCondition}
          </Button>

          <div className="flex gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
            <Button size="sm" onClick={handleSave} disabled={!canSave}>
              {ButtonLabels.saveRule}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetDraft}>
              {ButtonLabels.cancel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

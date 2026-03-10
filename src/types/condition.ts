/**
 * Conditional logic types for the form builder.
 *
 * Conditions let users express rules like:
 *   "Show field B only when field A equals 'yes'"
 *   "Make field C required when field B is checked"
 */

export const ConditionOperators = {
  Equals: "equals",
  NotEquals: "not_equals",
  Contains: "contains",
  GreaterThan: "greater_than",
  LessThan: "less_than",
  IsChecked: "is_checked",
  IsNotChecked: "is_not_checked",
} as const;

export type ConditionOperator =
  (typeof ConditionOperators)[keyof typeof ConditionOperators];

export const CONDITION_OPERATORS = Object.values(ConditionOperators);

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  greater_than: "is greater than",
  less_than: "is less than",
  is_checked: "is checked",
  is_not_checked: "is not checked",
};

export const ConditionActions = {
  Show: "show",
  Hide: "hide",
  Require: "require",
  Unrequire: "unrequire",
} as const;

export type ConditionAction =
  (typeof ConditionActions)[keyof typeof ConditionActions];

export const CONDITION_ACTIONS = Object.values(ConditionActions);

export const CONDITION_ACTION_LABELS: Record<ConditionAction, string> = {
  show: "Show field",
  hide: "Hide field",
  require: "Make required",
  unrequire: "Make optional",
};

export interface FieldCondition {
  sourceFieldId: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface ConditionalRule {
  id: string;
  targetFieldId: string;
  action: ConditionAction;
  conditions: FieldCondition[];
  logicOperator: "and" | "or";
}

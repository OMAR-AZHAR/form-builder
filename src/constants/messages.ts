export const ValidationMessages = {
  required: (label: string) => `${label} can't be left empty`,
  meaningfulText: (label: string) =>
    `${label} must contain at least one letter`,
  noSpecialChars: (label: string) =>
    `${label} can only contain letters, numbers, and spaces`,
  minLength: (n: number) => `Too short - use at least ${n} characters`,
  maxLength: (n: number) => `Too long - keep it under ${n} characters`,
  invalidPattern: "This doesn't look quite right - check the format",
  invalidPatternConfig:
    "Something's wrong with the validation rule. Try updating the pattern.",
  invalidNumber: "This needs to be a number",
  minValue: (n: number) => `Enter a value of ${n} or higher`,
  maxValue: (n: number) => `Enter a value of ${n} or lower`,
  invalidDate: "That doesn't look like a valid date",
  minDate: (d: string) => `Pick a date on or after ${d}`,
  maxDate: (d: string) => `Pick a date on or before ${d}`,
} as const;

export const ToastMessages = {
  saveSuccess: "Your form has been saved!",
  saveFailed: "We couldn't save your form - please try again.",
  exportSuccess: "Your form has been exported as JSON.",
  exportFailed: "Something went wrong while exporting. Give it another try.",
  submitSuccess: "All done - form submitted successfully!",
  submitInvalid:
    "Some fields need your attention - scroll up to fix the highlighted errors.",
  formNameRequired: "Give your form a name before proceeding.",
  noFields: "Your form is empty - add at least one field to get started.",
  deleteSuccess: "Form deleted.",
  deleteFailed: "We couldn't delete the form - please try again.",
  loadFailed: "We couldn't load your saved forms right now.",
  fieldLabelInvalid: (position: number, fieldType: string) =>
    `Field #${position} (${fieldType}) has an invalid or missing label. Give it a proper name.`,
  optionLabelInvalid: (fieldLabel: string) =>
    `"${fieldLabel}" has an option with an invalid label. Fix it before saving.`,
  optionValueEmpty: (fieldLabel: string) =>
    `"${fieldLabel}" has an option with an empty value. Every option needs a value.`,
  fieldAdded: (fieldType: string) => `${fieldType} added to your form.`,
  fieldRemoved: "Field removed.",
  fieldRemoveBlocked:
    "This field is used in a conditional rule. Remove the rule first.",
  fieldMoved: "Field position updated.",
  ruleAdded: "Conditional rule added.",
  ruleRemoved: "Conditional rule removed.",
  formReset: "Form cleared - ready to start fresh.",
  fieldRemoveConflict: (dependentLabels: string) =>
    `Cannot remove this field - it is referenced by conditional rules on: ${dependentLabels}. Remove those conditions first.`,
  fieldCount: (count: number) => `${count} field${count !== 1 ? "s" : ""}`,
} as const;

export const Themes = {
  Light: "light",
  Dark: "dark",
} as const;

export type Theme = (typeof Themes)[keyof typeof Themes];

export const LogicOperators = {
  And: "and",
  Or: "or",
} as const;

export const AppLabels = {
  appTitle: "Form Builder",
  appSubtitle: "Advanced Workflow Designer",
  switchTheme: (current: string) =>
    `Switch to ${current === Themes.Light ? Themes.Dark : Themes.Light} mode`,
} as const;

export const FormLabels = {
  formNamePlaceholder: "Form name *",
  descriptionPlaceholder: "Description (optional)",
  untitledForm: "Untitled Form",
  formNameLabel: "Form name",
  defaultFieldLabel: "This field",
  defaultFilename: "form",
  checkboxFallbackLabel: "Checkbox",
  untitledField: (fieldType: string) => `Untitled (${fieldType})`,
  lastSaved: "Last saved:",
  whenPrefix: "when ",
  formLoaded: (name: string) => `Loaded "${name}"`,
  formEditing: (name: string) => `Editing "${name}"`,
} as const;

export const ButtonLabels = {
  save: "Save",
  exportJson: "Export JSON",
  newForm: "New Form",
  submit: "Submit",
  dismiss: "dismiss",
  addRule: "Add Rule",
  saveRule: "Save Rule",
  cancel: "Cancel",
  addOption: "Add Option",
  removeField: "Remove Field",
  moveUp: "Move Up",
  moveDown: "Move Down",
  preview: "Preview",
  edit: "Edit",
  delete: "Delete",
} as const;

export const SectionLabels = {
  addField: "Add Field",
  conditionalRules: "Conditional Rules",
  savedForms: "Saved Forms",
  configureField: "Configure Field",
  textValidation: "Text Validation",
  numberValidation: "Number Validation",
  dateValidation: "Date Validation",
  options: "Options",
  newConditionalRule: "New Conditional Rule",
} as const;

export const FieldConfigLabels = {
  label: "Label",
  placeholder: "Placeholder",
  required: "Required",
  minLength: "Min Length",
  maxLength: "Max Length",
  regexPattern: "Regex Pattern",
  patternErrorMessage: "Pattern Error Message",
  minValue: "Min Value",
  maxValue: "Max Value",
  earliestDate: "Earliest Date",
  latestDate: "Latest Date",
  action: "Action",
  targetField: "Target Field",
  when: "When",
  operator: "Operator",
  value: "Value",
} as const;

export const PlaceholderTexts = {
  enterFieldLabel: "Enter field label",
  enterPlaceholderText: "Enter placeholder text",
  regexExample: "e.g. ^[A-Za-z]+$",
  customPatternMessage: "Custom message when pattern fails",
  selectField: "Select field...",
  selectOption: "Select an option...",
  selectValue: "Select...",
  enterValue: "Enter value",
  optionLabel: "Label",
  optionValue: "Value",
  joinAnd: " AND ",
  joinOr: " OR ",
} as const;

export const EmptyStateTexts = {
  noFieldsTitle: "No fields yet",
  noFieldsDescription: "Add a field from the sidebar to start building your form",
  noVisibleFields: "All fields are hidden by conditional rules.",
  noRulesDescription:
    "No conditional rules defined. Add a rule to control field visibility or requirements based on other field values.",
  loadingForms: "Loading saved forms...",
  noSavedForms: "No saved forms yet. Build a form and hit Save.",
} as const;

export const AriaLabels = {
  dragToReorder: "Drag to reorder",
  closeConfigurator: "Close configurator",
  removeOption: "Remove option",
  removeRule: "Remove rule",
  configureField: "Configure field",
  removeField: "Remove field",
  required: "required",
} as const;

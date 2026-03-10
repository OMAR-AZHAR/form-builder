import { memo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FieldConfig, FieldValue, FormValues, ConditionalRule, ValidationResult } from "@/types";
import { FieldRenderer } from "@/components/fields/FieldRenderer";
import { isFieldVisible, isFieldRequired } from "@/validation/engine";
import { Button, Card } from "@/components/ui";
import { cn } from "@/utils/cn";
import { FormLabels, ButtonLabels, EmptyStateTexts, AriaLabels } from "@/constants/messages";
import { Send, LayoutList, GripVertical, X } from "lucide-react";

interface SortableFieldProps {
  field: FieldConfig;
  isSelected: boolean;
  isEditing: boolean;
  value: FieldValue;
  error: string | undefined;
  onFieldChange: (fieldId: string, value: FieldValue) => void;
  onFieldSelect: (fieldId: string) => void;
  onRemove: (fieldId: string) => void;
}

const SortableField = memo(function SortableField({
  field,
  isSelected,
  isEditing,
  value,
  error,
  onFieldChange,
  onFieldSelect,
  onRemove,
}: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={isEditing ? () => onFieldSelect(field.id) : undefined}
      className={cn(
        "group relative rounded-lg p-3 -mx-3 transition-colors duration-150 border-2",
        isDragging && "opacity-50 shadow-lg z-10",
        isEditing && "cursor-pointer",
        isEditing && isSelected
          ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-400"
          : "border-transparent",
        isEditing &&
          !isSelected &&
          "hover:border-surface-300 hover:bg-surface-50 dark:hover:border-surface-600 dark:hover:bg-surface-800/50",
      )}
    >
      <div className={cn("flex gap-2", isEditing && "items-start")}>
        {isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            icon={<GripVertical className="h-4 w-4" />}
            aria-label={AriaLabels.dragToReorder}
            className="mt-2 shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
        <div className={cn("flex-1 min-w-0", isEditing && "pointer-events-none")}>
          <FieldRenderer
            field={field}
            value={value}
            error={error}
            onChange={onFieldChange}
            disabled={isEditing}
          />
        </div>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(field.id);
            }}
            icon={<X className="h-4 w-4" />}
            aria-label={AriaLabels.removeField}
            className="mt-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 dark:hover:text-danger-400"
          />
        )}
      </div>
    </div>
  );
});

interface FormPreviewProps {
  formName: string;
  formDescription: string;
  fields: FieldConfig[];
  conditions: ConditionalRule[];
  formValues: FormValues;
  validationErrors: ValidationResult;
  selectedFieldId: string | null;
  isEditing: boolean;
  onFieldChange: (fieldId: string, value: FieldValue) => void;
  onFieldSelect: (fieldId: string) => void;
  onRemove: (fieldId: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onSubmit: () => void;
}

export const FormPreview = memo(function FormPreview({
  formName,
  formDescription,
  fields,
  conditions,
  formValues,
  validationErrors,
  selectedFieldId,
  isEditing,
  onFieldChange,
  onFieldSelect,
  onRemove,
  onReorder,
  onSubmit,
}: FormPreviewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        onReorder(String(active.id), String(over.id));
      }
    },
    [onReorder],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit],
  );

  const visibleFields = fields.filter((f) =>
    isFieldVisible(f.id, conditions, formValues),
  );

  if (fields.length === 0) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LayoutList className="h-12 w-12 text-surface-400 dark:text-surface-600 mb-3" />
          <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
            {EmptyStateTexts.noFieldsTitle}
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
            {EmptyStateTexts.noFieldsDescription}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
          {formName || FormLabels.untitledForm}
        </h2>
        {formDescription && (
          <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
            {formDescription}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-5">
              {visibleFields.map((field) => {
                const effectiveField = {
                  ...field,
                  required: isFieldRequired(field, conditions, formValues),
                };
                return (
                  <SortableField
                    key={field.id}
                    field={effectiveField}
                    isSelected={field.id === selectedFieldId}
                    isEditing={isEditing}
                    value={formValues[field.id]}
                    error={validationErrors[field.id]}
                    onFieldChange={onFieldChange}
                    onFieldSelect={onFieldSelect}
                    onRemove={onRemove}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {visibleFields.length === 0 && (
          <p className="text-center text-sm text-surface-500 py-8">
            {EmptyStateTexts.noVisibleFields}
          </p>
        )}

        {!isEditing && visibleFields.length > 0 && (
          <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
            <Button
              type="submit"
              size="lg"
              icon={<Send className="h-4 w-4" />}
            >
              {ButtonLabels.submit}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
});

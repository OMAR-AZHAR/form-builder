import { memo, useEffect, useState, useCallback } from "react";
import type { FormConfiguration } from "@/types";
import { formApi } from "@/api/mock-api";
import { ToastMessages, SectionLabels, ButtonLabels, EmptyStateTexts, FormLabels } from "@/constants/messages";
import { Button } from "@/components/ui";
import { FolderOpen, Pencil, Trash2, Clock } from "lucide-react";

interface SavedFormsListProps {
  onLoad: (config: FormConfiguration) => void;
  onEdit: (config: FormConfiguration) => void;
  onToast: (type: "success" | "error", message: string) => void;
  refreshKey: number;
}

export const SavedFormsList = memo(function SavedFormsList({
  onLoad,
  onEdit,
  onToast,
  refreshKey,
}: SavedFormsListProps) {
  const [forms, setForms] = useState<FormConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await formApi.list();
      setForms(data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } catch {
      onToast("error", ToastMessages.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    loadForms();
  }, [loadForms, refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      await formApi.remove(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
      onToast("success", ToastMessages.deleteSuccess);
    } catch {
      onToast("error", ToastMessages.deleteFailed);
    }
  };

  if (loading) {
    return (
      <p className="text-xs text-surface-500 dark:text-surface-400 py-2">
        {EmptyStateTexts.loadingForms}
      </p>
    );
  }

  if (forms.length === 0) {
    return (
      <p className="text-xs text-surface-500 dark:text-surface-400 py-2">
        {EmptyStateTexts.noSavedForms}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300">
        {SectionLabels.savedForms}
      </h3>
      {forms.map((form) => (
        <div
          key={form.id}
          className="rounded-lg border border-surface-200 dark:border-surface-700 p-3 space-y-2"
        >
          <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
            {form.name || FormLabels.untitledForm}
          </p>
          <div className="flex items-center gap-1 text-xs text-surface-500">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(form.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="mx-1">&middot;</span>
            <span>{form.fields.length} fields</span>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<FolderOpen className="h-3 w-3" />}
              onClick={() => onLoad(form)}
            >
              {ButtonLabels.load}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil className="h-3 w-3" />}
              onClick={() => onEdit(form)}
            >
              {ButtonLabels.edit}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="h-3 w-3" />}
              onClick={() => handleDelete(form.id)}
            >
              {ButtonLabels.delete}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
});

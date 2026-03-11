import { memo, useEffect, useState } from "react";
import type { FormConfiguration } from "@/types";
import { formApi } from "@/api/mock-api";
import { ToastMessages, SectionLabels, ButtonLabels, EmptyStateTexts, FormLabels } from "@/constants/messages";
import { Button, SectionHeader } from "@/components/ui";
import { Eye, Pencil, Trash2, Clock } from "lucide-react";

interface SavedFormsListProps {
  onLoad: (config: FormConfiguration) => void;
  onEdit: (config: FormConfiguration) => void;
  onToast: (type: "success" | "error", message: string) => void;
  refreshKey: number;
}

/** Lists saved forms from the API with preview/edit/delete actions. Refetches when refreshKey changes. */
export const SavedFormsList = memo(function SavedFormsList({
  onLoad,
  onEdit,
  onToast,
  refreshKey,
}: SavedFormsListProps) {
  const [forms, setForms] = useState<FormConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent state updates after unmount (async race condition).
    let ignore = false;

    async function loadForms() {
      setLoading(true);
      try {
        const data = await formApi.list();
        if (!ignore) {
          setForms(data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
        }
      } catch {
        if (!ignore) onToast("error", ToastMessages.loadFailed);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadForms();
    return () => {
      ignore = true;
    };
  }, [onToast, refreshKey]);

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
      <SectionHeader>{SectionLabels.savedForms}</SectionHeader>
      {forms.map((form) => (
        <div
          key={form.id}
          className="list-item"
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
            <span>{ToastMessages.fieldCount(form.fields.length)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              icon={<Eye className="h-3 w-3" />}
              onClick={() => onLoad(form)}
            >
              {ButtonLabels.preview}
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

import { memo } from "react";
import { FIELD_TYPES, FIELD_TYPE_LABELS } from "@/types";
import type { FieldType } from "@/types";
import { Button, SectionHeader } from "@/components/ui";
import { SectionLabels } from "@/constants/messages";
import {
  Type,
  Hash,
  ChevronDown,
  CheckSquare,
  Calendar,
} from "lucide-react";

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  text: <Type className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  select: <ChevronDown className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
};

interface FieldTypeSelectorProps {
  onSelect: (type: FieldType) => void;
}

/** Sidebar buttons to add each field type (text, number, select, checkbox, date). */
export const FieldTypeSelector = memo(function FieldTypeSelector({
  onSelect,
}: FieldTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <SectionHeader>{SectionLabels.addField}</SectionHeader>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {FIELD_TYPES.map((type) => (
          <Button
            key={type}
            variant="secondary"
            size="sm"
            icon={FIELD_ICONS[type]}
            onClick={() => onSelect(type)}
            className="justify-start"
          >
            {FIELD_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  );
});

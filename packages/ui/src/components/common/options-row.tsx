import React from "react";
import { Label } from "@workspace/ui/components/label";

type OptionsRowProps = {
  id?: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  control: React.ReactNode;
  valueDisplay?: React.ReactNode;
  className?: string;
};

export function OptionsRow({
  id,
  icon,
  label,
  description,
  control,
  valueDisplay,
  className = "",
}: OptionsRowProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="space-y-1 flex-1">
        <Label htmlFor={id} className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </Label>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        {valueDisplay}
        {control}
      </div>
    </div>
  );
}

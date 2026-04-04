import React from "react";
import { ProductionSummary, SaveStatus } from "@/types/hms";
import { cn } from "@/lib/utils";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface SummaryPanelProps {
  summary: ProductionSummary;
  onChange: (summary: ProductionSummary) => void;
  onBlur?: () => void;
  saveStatus: SaveStatus;
  readOnly?: boolean;
}

export function SummaryPanel({ summary, onChange, onBlur, saveStatus, readOnly }: SummaryPanelProps) {
  const handleField = (field: keyof ProductionSummary, value: unknown) => {
    onChange({ ...summary, [field]: value });
  };

  const numField = (label: string, field: keyof ProductionSummary) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</label>
      <input
        type="number"
        value={(summary[field] as number | null) ?? ""}
        onChange={(e) =>
          handleField(field, e.target.value === "" ? null : Number(e.target.value))
        }
        onBlur={onBlur}
        disabled={readOnly}
        className="bg-input border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );

  const textField = (label: string, field: keyof ProductionSummary) => (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</label>
      <input
        type="text"
        value={(summary[field] as string) ?? ""}
        onChange={(e) => handleField(field, e.target.value)}
        onBlur={onBlur}
        disabled={readOnly}
        className="bg-input border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
      />
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Shift Summary
        </h3>
        <SaveStatusIndicator status={saveStatus} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Production</p>
        {numField("Total Production", "totalProduction")}
        {numField("Std CT", "stdCT")}
        {numField("Std Prod/Hr", "stdProdHr")}
        {numField("Actual CT", "actualCT")}
        {numField("Actual Prod/Hr", "actualProdHr")}
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Quality</p>
        {numField("Scrap", "scrap")}
        {numField("Scrap Qty", "scrapQty")}
        {numField("Rework", "rework")}
        {numField("Efficiency %", "efficiency")}
        {textField("Quality Status", "qualityStatus")}
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Machine</p>
        {textField("Machine Name", "machineName")}
        {textField("B/N Machine", "bNMachine")}
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="text-[10px] text-primary font-semibold uppercase tracking-widest">Approvals</p>
        {textField("Shift Engineer", "shiftEngineerApproval")}
        {textField("Manager", "managerApproval")}
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case "saving":
      return (
        <span className="flex items-center gap-1 text-xs text-warning animate-pulse-save">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
        </span>
      );
    case "saved":
      return (
        <span className="flex items-center gap-1 text-xs text-accent">
          <CheckCircle className="w-3 h-3" /> Saved
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" /> Error
        </span>
      );
    default:
      return null;
  }
}

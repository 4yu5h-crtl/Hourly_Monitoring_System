import React from "react";
import { HourlyEntry, SaveStatus, ProductionSummary } from "@/types/hms";
import { HMSRow } from "./HMSRow";

interface HMSTableProps {
  entries: HourlyEntry[];
  onEntryChange: (index: number, entry: HourlyEntry) => void;
  onEntryBlur?: (index: number) => void;
  saveStatus: SaveStatus;
  selectedMachine?: string;
  readOnly?: boolean;
  summary?: ProductionSummary;
  onSummaryChange?: (summary: ProductionSummary) => void;
  onSummaryBlur?: () => void;
  shiftId?: number;
}

export function HMSTable({ 
  entries, onEntryChange, onEntryBlur, saveStatus, selectedMachine, readOnly,
  summary, onSummaryChange, onSummaryBlur, shiftId = 1
}: HMSTableProps) {
  const lossEditingEnabled = Boolean(selectedMachine?.trim());

  const shiftHours = shiftId === 1 ? "8.5" : shiftId === 2 ? "8.2" : "7.3";

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[100px_90px_90px_90px_1fr_140px] gap-0 bg-secondary/60 border-b-2 border-primary/20 sticky top-0 z-10">
        {["PERIOD", "CUM QTY", "HOURLY QTY", "+/- STD", "REASONS FOR LOSS", "LOSS DETAILS"].map(
          (h) => (
            <div
              key={h}
              className="px-2 py-2.5 text-[10px] font-bold text-black uppercase tracking-wider border-r border-border last:border-r-0"
            >
              {h}
            </div>
          )
        )}
      </div>

      {/* Rows */}
      {entries.map((entry, i) => (
        <HMSRow
          key={entry.id}
          entry={entry}
          onChange={(updated) => onEntryChange(i, updated)}
          onBlur={onEntryBlur ? () => onEntryBlur(i) : undefined}
          saveStatus={saveStatus}
          lossEditingEnabled={lossEditingEnabled}
          readOnly={readOnly}
        />
      ))}

      {!lossEditingEnabled && (
        <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-200">
          Select a machine to enable loss details and loss reason entry.
        </div>
      )}

      {/* Summary Bottom Rows */}
      {summary && onSummaryChange && (
        <div className="text-sm border-t-2 border-primary/20">
          {/* Row 1: Total Hours */}
          <div className="grid grid-cols-[100px_90px_90px_90px_1fr_140px] gap-0 border-b border-border items-stretch">
            <div className="px-2 py-1.5 flex items-center border-r border-border bg-secondary/30">
              <span className="text-xs font-bold text-black">Total @ {shiftHours} hrs</span>
            </div>
            <div className="px-1.5 py-1.5 border-r border-border bg-secondary/10"></div>
            <div className="px-1.5 py-1.5 border-r border-border bg-secondary/10"></div>
            <div className="px-1.5 py-1.5 border-r border-border bg-secondary/10"></div>
            
            <div className="px-1.5 py-1.5 border-r border-border flex items-center gap-2">
              <span className="whitespace-nowrap text-xs font-semibold">Present Operators (Token No.):</span>
              <input
                className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={summary.presentOperators || ""}
                onChange={(e) => onSummaryChange({ ...summary, presentOperators: e.target.value })}
                onBlur={onSummaryBlur}
                disabled={readOnly}
                placeholder="e.g. 2014, 2030, 2105"
              />
            </div>
            
            <div className="px-1.5 py-1.5 flex items-center gap-2 bg-secondary/10">
              {/* Empty space for LOSS DETAILS column */}
            </div>
          </div>

          {/* Row 2: RHrs */}
          <div className="grid grid-cols-[100px_90px_90px_90px_1fr_140px] gap-0 border-b border-border items-stretch">
            <div className="px-2 py-1.5 flex items-center border-r border-border bg-secondary/30">
              <span className="text-xs font-bold text-black">RHrs.</span>
            </div>
            <div className="px-1.5 py-1.5 border-r border-border bg-secondary/10"></div>
            <div className="px-1.5 py-1.5 border-r border-border bg-secondary/10"></div>
            <div className="px-1.5 py-1.5 border-r border-border bg-secondary/10"></div>
            
            <div className="px-1.5 py-1.5 border-r border-border flex items-center gap-2">
              <span className="whitespace-nowrap text-xs font-semibold">Absent Operators (Token No.):</span>
              <input
                className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                value={summary.absentOperators || ""}
                onChange={(e) => onSummaryChange({ ...summary, absentOperators: e.target.value })}
                onBlur={onSummaryBlur}
                disabled={readOnly}
                placeholder="e.g. 2045, 2011"
              />
            </div>
            
            <div className="px-1.5 py-1.5 flex items-center gap-2 bg-secondary/10">
              {/* Empty space for LOSS DETAILS column */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

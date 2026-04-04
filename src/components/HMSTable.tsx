import React from "react";
import { HourlyEntry, SaveStatus } from "@/types/hms";
import { HMSRow } from "./HMSRow";

interface HMSTableProps {
  entries: HourlyEntry[];
  onEntryChange: (index: number, entry: HourlyEntry) => void;
  onEntryBlur?: (index: number) => void;
  saveStatus: SaveStatus;
  readOnly?: boolean;
}

export function HMSTable({ entries, onEntryChange, onEntryBlur, saveStatus, readOnly }: HMSTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[100px_90px_90px_90px_1fr_140px] gap-0 bg-secondary/60 border-b-2 border-primary/20 sticky top-0 z-10">
        {["PERIOD", "CUM QTY", "HRLY QTY", "+/- STD", "REASONS FOR LOSS", "LOSS DETAILS"].map(
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
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  HourlyEntry, LossDetails, LossKey, LOSS_COLUMNS,
  QUICK_INSERT_PHRASES, SaveStatus,
} from "@/types/hms";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

interface HMSRowProps {
  entry: HourlyEntry;
  onChange: (entry: HourlyEntry) => void;
  onBlur?: () => void;
  saveStatus: SaveStatus;
  readOnly?: boolean;
}

export function HMSRow({ entry, onChange, onBlur, saveStatus, readOnly = false }: HMSRowProps) {
  const [lossExpanded, setLossExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filledLossCount = Object.values(entry.lossDetails).filter(
    (v) => v !== null && v !== 0
  ).length;

  const handleField = useCallback(
    (field: keyof HourlyEntry, value: unknown) => {
      onChange({ ...entry, [field]: value, edited: true });
    },
    [entry, onChange]
  );

  const handleLoss = useCallback(
    (key: LossKey, value: string) => {
      const num = value === "" ? null : Number(value);
      onChange({
        ...entry,
        lossDetails: { ...entry.lossDetails, [key]: num },
        edited: true,
      });
    },
    [entry, onChange]
  );

  const insertPhrase = useCallback(
    (text: string) => {
      const current = entry.reasonsText;
      const newText = current ? `${current}\n${text}` : text;
      onChange({ ...entry, reasonsText: newText, edited: true });
    },
    [entry, onChange]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [entry.reasonsText]);

  const numInput = (
    value: number | null,
    onChangeVal: (v: string) => void,
    className?: string
  ) => (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChangeVal(e.target.value)}
      onBlur={onBlur}
      disabled={readOnly}
      className={cn(
        "w-full bg-input border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground",
        "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
    />
  );

  return (
    <div
      className={cn(
        "border-b border-border transition-colors",
        entry.edited && "cell-edited"
      )}
    >
      {/* Main row */}
      <div className="grid grid-cols-[100px_90px_90px_90px_1fr_140px] gap-0 items-stretch">
        {/* Period */}
        <div className="px-2 py-2 flex items-center border-r border-border">
          <span className="text-xs font-mono text-black font-medium">
            {entry.timeSlot}
          </span>
        </div>

        {/* CUM QTY */}
        <div className="px-1.5 py-1.5 border-r border-border">
          {numInput(entry.cumQty, (v) =>
            handleField("cumQty", v === "" ? null : Number(v))
          )}
        </div>

        {/* HRLY QTY - calculated */}
        <div className="px-1.5 py-1.5 border-r border-border flex items-center justify-center">
          <span
            className={cn(
              "text-sm font-mono font-semibold",
              entry.hrlyQty !== null && entry.hrlyQty > 0
                ? "text-accent"
                : "text-black"
            )}
          >
            {entry.hrlyQty ?? "—"}
          </span>
        </div>

        {/* +/- STD */}
        <div className="px-1.5 py-1.5 border-r border-border flex items-center justify-center">
          <span
            className={cn(
              "text-sm font-mono font-semibold",
              entry.stdVariance !== null &&
                (entry.stdVariance >= 0 ? "text-accent" : "text-destructive")
            )}
          >
            {entry.stdVariance !== null
              ? (entry.stdVariance >= 0 ? "+" : "") + entry.stdVariance
              : "—"}
          </span>
        </div>

        {/* Reasons for Loss */}
        <div className="px-1.5 py-1.5 border-r border-border">
          <div className="flex flex-col gap-1">
            <textarea
              ref={textareaRef}
              value={entry.reasonsText}
              onChange={(e) => handleField("reasonsText", e.target.value)}
              onBlur={onBlur}
              disabled={readOnly}
              rows={1}
              placeholder="Reasons for loss..."
              className={cn(
                "w-full bg-input border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground resize-none overflow-hidden",
                "focus:outline-none focus:ring-1 focus:ring-primary",
                "disabled:opacity-60 placeholder:text-black/50"
              )}
            />
            {!readOnly && (
              <div className="flex flex-wrap gap-1">
                {QUICK_INSERT_PHRASES.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => { insertPhrase(p.text); onBlur && onBlur(); }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-black hover:text-primary hover:bg-secondary/80 transition-colors border border-border"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loss toggle */}
        <div className="px-1.5 py-1.5 flex items-center">
          <button
            onClick={() => setLossExpanded(!lossExpanded)}
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors w-full justify-center",
              filledLossCount > 0
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-secondary text-black border border-border hover:text-foreground"
            )}
          >
            {lossExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Loss ({filledLossCount})
          </button>
        </div>
      </div>

      {/* Expanded loss details */}
      {lossExpanded && (
        <div className="bg-secondary/30 border-t border-border px-3 py-2 animate-accordion-down">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
            {LOSS_COLUMNS.map((col) => (
              <div key={col.key} className="flex flex-col gap-0.5">
                <label className="text-[10px] text-black font-medium truncate">
                  {col.label}
                  {col.code && (
                    <span className="text-black/50 ml-0.5">({col.code})</span>
                  )}
                </label>
                <input
                  type="number"
                  value={entry.lossDetails[col.key as LossKey] ?? ""}
                  onChange={(e) => handleLoss(col.key as LossKey, e.target.value)}
                  onBlur={onBlur}
                  disabled={readOnly}
                  className="w-full bg-input border border-border rounded px-1.5 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

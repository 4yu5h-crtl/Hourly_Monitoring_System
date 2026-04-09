import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  HourlyEntry, LossDetails, LossKey, LOSS_COLUMNS,
  QUICK_INSERT_PHRASES, SaveStatus,
} from "@/types/hms";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Download } from "lucide-react";
import { fetchCumQtyFromPLC } from "@/lib/api";

interface HMSRowProps {
  entry: HourlyEntry;
  onChange: (entry: HourlyEntry) => void;
  onBlur?: () => void;
  saveStatus: SaveStatus;
  lossEditingEnabled?: boolean;
  readOnly?: boolean;
}

export function HMSRow({ entry, onChange, onBlur, saveStatus, lossEditingEnabled = true, readOnly = false }: HMSRowProps) {
  const [lossExpanded, setLossExpanded] = useState(false);
  const [isFetchingPLC, setIsFetchingPLC] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filledLossCount = LOSS_COLUMNS.filter((col) => {
    const val = entry.lossDetails[col.key];
    const reason = entry.lossDetails[`${col.key}_reason` as keyof LossDetails];
    return (val !== null && val !== 0 && val !== "") || (reason !== null && reason !== "");
  }).length;

  const handleField = useCallback(
    (field: keyof HourlyEntry, value: unknown) => {
      onChange({ ...entry, [field]: value, edited: true });
    },
    [entry, onChange]
  );

  const handleLoss = useCallback(
    (key: string, value: string) => {
      if (!lossEditingEnabled) return;

      // Handle numeric fields (e.g., "ct_loss")
      if (key.endsWith("_reason")) {
        // String value for reason fields
        onChange({
          ...entry,
          lossDetails: { ...entry.lossDetails, [key]: value },
          edited: true,
        });
      } else {
        // Numeric value for loss fields
        const num = value === "" ? null : Number(value);
        onChange({
          ...entry,
          lossDetails: { ...entry.lossDetails, [key]: num },
          edited: true,
        });
      }
    },
    [entry, onChange, lossEditingEnabled]
  );

  const insertPhrase = useCallback(
    (text: string) => {
      if (!lossEditingEnabled) return;

      const current = entry.reasonsText;
      const newText = current ? `${current}\n${text}` : text;
      onChange({ ...entry, reasonsText: newText, edited: true });
    },
    [entry, onChange, lossEditingEnabled]
  );

  const lossFieldsDisabled = readOnly || !lossEditingEnabled;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [entry.reasonsText]);

  const handleFetchFromPLC = async () => {
    if (readOnly) return;
    try {
      setIsFetchingPLC(true);
      const res = await fetchCumQtyFromPLC();
      if (res && res.success && typeof res.value !== 'undefined') {
        const val = Number(res.value);
        if (!isNaN(val)) {
          handleField("cumQty", val);
          if (onBlur) onBlur(); // Auto-save after fetch
        }
      }
    } catch (e) {
      console.error("Failed to fetch from PLC", e);
    } finally {
      setIsFetchingPLC(false);
    }
  };

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
      disabled={true} // Hardcoded to true so only the database can modify this field
      className={cn(
        "w-full bg-input border border-border rounded px-2 py-1.5 text-sm font-mono text-foreground bg-muted",
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
        <div className="px-1.5 py-1.5 border-r border-border relative flex items-center">
          {numInput(entry.cumQty, () => {})}
        </div>

        {/* HOURLY QTY - calculated (no signs) */}
        <div className="px-1.5 py-1.5 border-r border-border flex items-center justify-center">
          <span
            className={cn(
              "text-sm font-mono font-semibold text-accent"
            )}
          >
            {entry.hrlyQty !== null ? Math.abs(entry.hrlyQty) : "—"}
          </span>
        </div>

        {/* +/- STD */}
        <div className="px-1.5 py-1.5 border-r border-border flex items-center justify-center">
          <span
            className={cn(
              "text-sm font-mono font-semibold",
              entry.stdVariance !== null &&
                (entry.stdVariance >= 0 ? "text-green-600" : "text-destructive")
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
              disabled={lossFieldsDisabled}
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
                    disabled={!lossEditingEnabled}
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
        <div className="bg-secondary/30 border-t border-border px-3 py-2 animate-accordion-down overflow-x-auto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2 min-w-max">
            {LOSS_COLUMNS.map((col) => {
              const reasonKey = `${col.key}_reason` as keyof LossDetails;
              return (
                <div key={col.key} className="flex flex-col gap-1 w-full border border-border/30 rounded p-2 bg-background/50">
                  {/* Label */}
                  <label className="text-[9px] text-black font-semibold truncate" title={col.label}>
                    {col.label}
                    {col.code && (
                      <span className="text-black/60 ml-0.5 font-normal">({col.code})</span>
                    )}
                  </label>

                  {/* Numeric value input */}
                  <input
                    type="number"
                    placeholder="Value"
                    value={entry.lossDetails[col.key as LossKey] ?? ""}
                    onChange={(e) => handleLoss(col.key, e.target.value)}
                    onBlur={onBlur}
                    disabled={lossFieldsDisabled}
                    className="w-full bg-input border border-border rounded px-1.5 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {/* Reason text input */}
                  <textarea
                    placeholder="Reason..."
                    value={entry.lossDetails[reasonKey] ?? ""}
                    onChange={(e) => handleLoss(reasonKey as string, e.target.value)}
                    onBlur={onBlur}
                    disabled={lossFieldsDisabled}
                    className="w-full bg-input border border-border rounded px-1.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 resize-none"
                    rows={2}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

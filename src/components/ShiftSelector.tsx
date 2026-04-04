import React, { useState, useEffect } from "react";
import { SHIFTS } from "@/types/hms";
import { cn } from "@/lib/utils";
import skfLogo from "@/assets/skf-logo.png";

interface ShiftSelectorProps {
  date: string;
  machine: string;
  channel: string;
  shiftId: number;
  onDateChange: (date: string) => void;
  onMachineChange: (machine: string) => void;
  onChannelChange: (channel: string) => void;
  onShiftChange: (shiftId: number) => void;
}

export function ShiftSelector({
  date, machine, channel, shiftId,
  onDateChange, onMachineChange, onChannelChange, onShiftChange,
}: ShiftSelectorProps) {
  const [localMachine, setLocalMachine] = useState(machine);
  const [localChannel, setLocalChannel] = useState(channel);

  useEffect(() => {
    setLocalMachine(machine);
  }, [machine]);

  useEffect(() => {
    setLocalChannel(channel);
  }, [channel]);

  const inputClass = "bg-input border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

  return (
    <div className="gradient-header shimmer-top border-2 border-border rounded-lg p-5 mb-6 overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <img src={skfLogo} alt="SKF" className="h-10 md:h-12 object-contain" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text tracking-tight">
            HMS — Hourly Monitoring System
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Machine</label>
          <input
            type="text"
            value={localMachine}
            onChange={(e) => setLocalMachine(e.target.value)}
            onBlur={() => onMachineChange(localMachine)}
            placeholder="e.g. CNC-01"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Channel</label>
          <input
            type="text"
            value={localChannel}
            onChange={(e) => setLocalChannel(e.target.value)}
            onBlur={() => onChannelChange(localChannel)}
            placeholder="e.g. CH-1"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Shift</label>
          <div className="flex gap-1">
            {SHIFTS.map((s) => (
              <button
                key={s.id}
                onClick={() => onShiftChange(s.id)}
                className={cn(
                  "flex-1 px-2 py-2 rounded-md text-xs font-semibold transition-all border",
                  shiftId === s.id
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                )}
              >
                S{s.id}
                <span className="hidden md:inline ml-1 text-[10px] font-normal opacity-70">
                  {s.startTime}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

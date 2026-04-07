import React, { useState, useEffect } from "react";
import { getLogsForDate } from "@/lib/storage";
import { SHIFTS, ShiftLog } from "@/types/hms";
import { HMSTable } from "@/components/HMSTable";
import { SummaryPanel } from "@/components/SummaryPanel";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/csvExport";
import { Download } from "lucide-react";

const today = new Date().toISOString().slice(0, 10);

export default function HistoryPage() {
  const [date, setDate] = useState(today);
  const [logs, setLogs] = useState<ShiftLog[]>([]);
  const [activeShift, setActiveShift] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  // Get unique machines and channels for the selected shift
  const machinesForShift = Array.from(
    new Set(logs.filter((l) => l.shiftId === activeShift).map((l) => l.machine))
  ).sort();

  const channelsForMachine = Array.from(
    new Set(
      logs
        .filter((l) => l.shiftId === activeShift && l.machine === selectedMachine)
        .map((l) => l.channel)
    )
  ).sort();

  useEffect(() => {
    getLogsForDate(date).then((logsData) => {
      setLogs(logsData);
      // Reset selections when date changes
      setSelectedMachine(null);
      setSelectedChannel(null);
    }).catch((error) => {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
      setSelectedMachine(null);
      setSelectedChannel(null);
    });
  }, [date]);

  // Auto-select first machine when shift changes
  useEffect(() => {
    const machinesInShift = Array.from(
      new Set(logs.filter((l) => l.shiftId === activeShift).map((l) => l.machine))
    ).sort();
    
    if (machinesInShift.length > 0) {
      setSelectedMachine(machinesInShift[0]);
    } else {
      setSelectedMachine(null);
    }
    setSelectedChannel(null);
  }, [activeShift, logs]);

  // Auto-select first channel when machine changes
  useEffect(() => {
    if (selectedMachine) {
      const channelsInMachine = Array.from(
        new Set(
          logs
            .filter((l) => l.shiftId === activeShift && l.machine === selectedMachine)
            .map((l) => l.channel)
        )
      ).sort();
      
      if (channelsInMachine.length > 0) {
        setSelectedChannel(channelsInMachine[0]);
      } else {
        setSelectedChannel(null);
      }
    } else {
      setSelectedChannel(null);
    }
  }, [selectedMachine, activeShift, logs]);

  const activeLog = logs.find(
    (l) =>
      l.shiftId === activeShift &&
      l.machine === selectedMachine &&
      l.channel === selectedChannel
  );

  const handleExport = () => {
    exportToCSV(logs, date);
  };

  return (
    <div className="min-h-screen p-4 max-w-[1600px] mx-auto">
      <div className="gradient-header shimmer-top border-2 border-border rounded-lg p-5 mb-6 overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1 tracking-tight">
            Production History
          </h1>
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            View and review shift data
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Machine</label>
            <select
              value={selectedMachine || ""}
              onChange={(e) => setSelectedMachine(e.target.value || null)}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Machine...</option>
              {machinesForShift.map((machine) => (
                <option key={machine} value={machine}>
                  {machine}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Channel</label>
            <select
              value={selectedChannel || ""}
              onChange={(e) => setSelectedChannel(e.target.value || null)}
              disabled={!selectedMachine}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Channel...</option>
              {channelsForMachine.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 self-end">
            {SHIFTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveShift(s.id)}
                className={cn(
                  "px-4 py-2 rounded-md text-xs font-semibold border transition-all",
                  activeShift === s.id
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                )}
              >
                Shift {s.id}
              </button>
            ))}
          </div>
          <div className="self-end ml-2">
            <button
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {activeLog ? (
        <div className="flex gap-5">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                Machine: <span className="text-foreground">{activeLog.machine}</span>
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Channel: <span className="text-foreground">{activeLog.channel}</span>
              </span>
            </div>
            <HMSTable
              entries={activeLog.entries}
              onEntryChange={() => {}}
              saveStatus="idle"
              readOnly
            />
          </div>
          <div className="w-[280px] shrink-0 hidden lg:block">
            <SummaryPanel
              summary={activeLog.summary}
              onChange={() => {}}
              saveStatus="idle"
              readOnly
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            {selectedMachine && selectedChannel
              ? `No data for Shift ${activeShift} - ${selectedMachine} - ${selectedChannel} on ${date}`
              : selectedMachine
              ? `No data for Shift ${activeShift} - ${selectedMachine} on ${date}`
              : `No data for Shift ${activeShift} on ${date}`}
          </p>
        </div>
      )}
    </div>
  );
}

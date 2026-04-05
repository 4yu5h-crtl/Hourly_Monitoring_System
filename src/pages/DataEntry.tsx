import React, { useState, useCallback, useEffect, useRef } from "react";
import { ShiftSelector } from "@/components/ShiftSelector";
import { HMSTable } from "@/components/HMSTable";
import { SummaryPanel } from "@/components/SummaryPanel";
import {
  HourlyEntry, SaveStatus, ShiftLog,
} from "@/types/hms";
import {
  getOrCreateShiftLog, saveEntry, saveSummary, recalculate,
} from "@/lib/storage";

const today = new Date().toISOString().slice(0, 10);

export default function DataEntryPage() {
  const [date, setDate] = useState(today);
  const [machine, setMachine] = useState("");
  const [channel, setChannel] = useState("");
  const [shiftId, setShiftId] = useState(1);
  const [log, setLog] = useState<ShiftLog | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Load / create log when params change
  useEffect(() => {
    if (machine.trim() && channel.trim()) {
      getOrCreateShiftLog(date, shiftId, machine, channel).then((l) => {
        setLog(l);
      }).catch((error) => {
        console.error('Failed to load shift log:', error);
        setSaveStatus('error');
      });
    } else {
      setLog(null);
    }
  }, [date, shiftId, machine, channel]);

  const stdTarget = log?.summary.stdProdHr ?? 50; // default

  const handleEntryChange = useCallback(
    (index: number, entry: HourlyEntry) => {
      if (!log) return;
      const newEntries = [...log.entries];
      newEntries[index] = entry;
      const recalced = recalculate(newEntries, stdTarget);
      const newLog = { ...log, entries: recalced };
      setLog(newLog);
    },
    [log, stdTarget]
  );

  const handleEntryBlur = useCallback(
    async (index: number) => {
      if (!log) return;
      setSaveStatus("saving");
      try {
        await saveEntry(log.id, log.entries[index]);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [log]
  );

  const handleSummaryChange = useCallback(
    (summary: typeof log extends ShiftLog ? ShiftLog["summary"] : never) => {
      if (!log) return;
      setLog({ ...log, summary });
    },
    [log]
  );

  const handleSummaryBlur = useCallback(
    async () => {
      if (!log) return;
      setSaveStatus("saving");
      try {
        await saveSummary(log.id, log.summary);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [log]
  );

  return (
    <div className="min-h-screen p-4 max-w-[1600px] mx-auto">
      <ShiftSelector
        date={date}
        machine={machine}
        channel={channel}
        shiftId={shiftId}
        onDateChange={setDate}
        onMachineChange={setMachine}
        onChannelChange={setChannel}
        onShiftChange={setShiftId}
      />

      {log ? (
        <div className="flex gap-5">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
            <HMSTable
              entries={log.entries}
              onEntryChange={handleEntryChange}
              onEntryBlur={handleEntryBlur}
              saveStatus={saveStatus}
              summary={log.summary}
              onSummaryChange={handleSummaryChange}
              onSummaryBlur={handleSummaryBlur}
              shiftId={shiftId}
            />
          </div>

          <div className="w-[280px] shrink-0 hidden lg:block">
            <SummaryPanel
              summary={log.summary}
              onChange={handleSummaryChange}
              onBlur={handleSummaryBlur}
              saveStatus={saveStatus}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 bg-card border border-border rounded-lg mt-6">
          <p className="text-muted-foreground text-sm font-medium">
            Please enter Machine and Channel to load the production data.
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ShiftSelector } from "@/components/ShiftSelector";
import { HMSTable } from "@/components/HMSTable";
import { SummaryPanel } from "@/components/SummaryPanel";
import {
  HourlyEntry, SaveStatus, ShiftLog, CHANNEL_PLACEHOLDER_MACHINE,
} from "@/types/hms";
import {
  getOrCreateShiftLog, saveEntry, saveSummary, recalculate,
  getShiftLogFromSessionStorage, isCachedSessionValid,
} from "@/lib/storage";

const today = new Date().toISOString().slice(0, 10);

// SessionStorage keys for form state persistence
const FORM_STATE_KEY = 'hms_form_state';

interface FormState {
  date: string;
  machine: string;
  channel: string;
  shiftId: number;
}

/**
 * Save form state to sessionStorage
 */
function saveFormState(state: FormState): void {
  try {
    sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save form state:', e);
  }
}

/**
 * Get form state from sessionStorage
 */
function getFormState(): FormState | null {
  try {
    const data = sessionStorage.getItem(FORM_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('Failed to get form state:', e);
    return null;
  }
}

export default function DataEntryPage() {
  // Initialize state from sessionStorage if available
  const savedState = getFormState();

  const [date, setDate] = useState(savedState?.date || today);
  const [machine, setMachine] = useState(savedState?.machine || "");
  const [channel, setChannel] = useState(savedState?.channel || "");
  const [shiftId, setShiftId] = useState(savedState?.shiftId || 1);
  const [log, setLog] = useState<ShiftLog | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFresh, setIsFetchingFresh] = useState(false);
  const loadingRef = useRef(false);

  // Save form state whenever it changes
  useEffect(() => {
    saveFormState({ date, machine, channel, shiftId });
  }, [date, machine, channel, shiftId]);

  // Load / create log when params change
  useEffect(() => {
    if (channel.trim()) {
      loadingRef.current = true;
      const machineForShift = CHANNEL_PLACEHOLDER_MACHINE;

      // First, check if we have cached data in sessionStorage
      const cachedLog = getShiftLogFromSessionStorage();
      const isCached = isCachedSessionValid(date, shiftId, machineForShift, channel);

      if (isCached && cachedLog) {
        // Show cached data immediately
        console.log("Showing cached data from sessionStorage");
        setLog(cachedLog);
        setIsLoading(false);
        setIsFetchingFresh(true);

        // Fetch fresh data in background
        getOrCreateShiftLog(date, shiftId, machineForShift, channel)
          .then((freshLog) => {
            if (loadingRef.current) {
              setLog(freshLog);
              setIsFetchingFresh(false);
            }
            loadingRef.current = false;
          })
          .catch((error) => {
            console.error("Failed to refresh data:", error);
            setIsFetchingFresh(false);
            setSaveStatus("error");
            loadingRef.current = false;
          });
      } else {
        // No cache, fetch from server
        setIsLoading(true);
        setIsFetchingFresh(false);

        getOrCreateShiftLog(date, shiftId, machineForShift, channel)
          .then((l) => {
            if (loadingRef.current) {
              setLog(l);
            }
            loadingRef.current = false;
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Failed to load shift log:", error);
            setSaveStatus("error");
            loadingRef.current = false;
            setIsLoading(false);
          });
      }
    } else {
      setLog(null);
      loadingRef.current = false;
      setIsLoading(false);
      setIsFetchingFresh(false);
    }
  }, [date, shiftId, channel]);

  const actualProdHr = log?.summary.actualProdHr ?? null;

  const handleEntryChange = useCallback(
    (index: number, entry: HourlyEntry) => {
      if (!log) return;
      const newEntries = [...log.entries];
      newEntries[index] = entry;
      const recalced = recalculate(newEntries, actualProdHr);
      const newLog = { ...log, entries: recalced };
      setLog(newLog);
    },
    [log, actualProdHr]
  );

  const handleEntryBlur = useCallback(
    async (index: number) => {
      if (!log) return;
      setSaveStatus("saving");
      try {
        await saveEntry(log.id, log.entries[index], machine.trim() || null);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [log, machine]
  );

  const handleSummaryChange = useCallback(
    (summary: typeof log extends ShiftLog ? ShiftLog["summary"] : never) => {
      if (!log) return;
      // Recalculate entries if actualProdHr changed
      const recalced = recalculate(log.entries, summary.actualProdHr);
      setLog({ ...log, summary, entries: recalced });
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
            {isLoading && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                ⏳ Loading production data...
              </div>
            )}
            {isFetchingFresh && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✓ Showing cached data - Fetching fresh updates from server...
              </div>
            )}
            <HMSTable
              entries={log.entries}
              onEntryChange={handleEntryChange}
              onEntryBlur={handleEntryBlur}
              saveStatus={saveStatus}
              selectedMachine={machine}
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
            {isLoading 
              ? "Loading..." 
              : "Please select Channel to load the production data."}
          </p>
        </div>
      )}
    </div>
  );
}

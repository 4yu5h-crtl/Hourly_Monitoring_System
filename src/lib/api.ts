const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types matching the backend
export interface ShiftLogResponse {
  id: string;
  date: string;
  shift_id: number;
  machine: string;
  channel: string;
  entries: any[];
  summary: any;
}

export interface HourlyEntryResponse {
  id: string;
  shift_log_id: string;
  time_slot: string;
  cum_qty: number | null;
  hrly_qty: number | null;
  std_variance: number | null;
  reasons_text: string;
  edited: boolean;
}

// Shifts API
export async function getShifts(date?: string, shift?: number, machine?: string, channel?: string) {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (shift) params.append('shift', String(shift));
  if (machine) params.append('machine', machine);
  if (channel) params.append('channel', channel);

  const response = await fetch(`${API_BASE_URL}/shifts?${params}`);
  if (!response.ok) throw new Error('Failed to fetch shifts');
  return response.json();
}

export async function getShift(id: string) {
  const response = await fetch(`${API_BASE_URL}/shifts/${id}`);
  if (!response.ok) throw new Error('Failed to fetch shift');
  return response.json();
}

export async function createOrGetShift(
  date: string,
  shiftId: number,
  machine: string,
  channel: string
): Promise<ShiftLogResponse> {
  const response = await fetch(`${API_BASE_URL}/shifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, shift_id: shiftId, machine, channel }),
  });

  if (!response.ok) throw new Error('Failed to create/get shift');
  return response.json();
}

// Entries API
export async function updateEntry(
  entryId: string,
  data: Partial<HourlyEntryResponse> & { hrly_qty?: number | null; std_variance?: number | null }
) {
  const response = await fetch(`${API_BASE_URL}/entries/${entryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update entry');
  return response.json();
}

export async function updateLossDetails(
  entryId: string,
  lossData: Record<string, number | string | null | undefined>
) {
  const response = await fetch(`${API_BASE_URL}/entries/${entryId}/loss`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lossData),
  });

  if (!response.ok) throw new Error('Failed to update loss details');
  return response.json();
}

// Summary API
export async function updateSummary(
  shiftLogId: string,
  summaryData: Record<string, any>
) {
  const response = await fetch(`${API_BASE_URL}/summary/${shiftLogId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(summaryData),
  });

  if (!response.ok) throw new Error('Failed to update summary');
  return response.json();
}

export async function getSummary(shiftLogId: string) {
  const response = await fetch(`${API_BASE_URL}/summary/${shiftLogId}`);
  if (!response.ok) throw new Error('Failed to fetch summary');
  return response.json();
}

// Health check
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// OPC UA API
export async function fetchCumQtyFromPLC() {
  const response = await fetch(`${API_BASE_URL}/opc/cum-qty`);
  if (!response.ok) throw new Error('Failed to fetch from PLC');
  return response.json();
}

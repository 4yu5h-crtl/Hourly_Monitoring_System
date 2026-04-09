export interface ChannelOption {
  value: string;
  label: string;
}

export interface MachineOption {
  value: string;
  label: string;
}

export const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: "CH-02", label: "CH-02" },
];

const CHANNEL_MACHINE_MAP: Record<string, MachineOption[]> = {
  "CH-02": [
    { value: "CH-2 ABG-1129", label: "CH-2 ABG-1129" },
    { value: "CH-2 CL-1063", label: "CH-2 CL-1063" },
    { value: "CH-2 DEMAG-C2I2", label: "CH-2 DEMAG-C2I2" },
    { value: "CH-2 FDT-C2I1", label: "CH-2 FDT-C2I1" },
    { value: "CH-2 FSF-1235-F", label: "CH-2 FSF-1235-F" },
    { value: "CH-2 FSF-1235-R", label: "CH-2 FSF-1235-R" },
    { value: "CH-2 FSF-1236-F", label: "CH-2 FSF-1236-F" },
    { value: "CH-2 FSF-1236-R", label: "CH-2 FSF-1236-R" },
    { value: "CH-2 HIT-1255", label: "CH-2 HIT-1255" },
    { value: "CH-2 HMV-1237", label: "CH-2 HMV-1237" },
    { value: "CH-2 IMP-1252", label: "CH-2 IMP-1252" },
    { value: "CH-2 IR-CH-2", label: "CH-2 IR-CH-2" },
    { value: "CH-2 IRL-864", label: "CH-2 IRL-864" },
    { value: "CH-2 Laser Marking CH02", label: "CH-2 Laser Marking CH02" },
    { value: "CH-2 MGI-C2A1", label: "CH-2 MGI-C2A1" },
    { value: "CH-2 MVM-1258", label: "CH-2 MVM-1258" },
    { value: "CH-2 MYD-1257", label: "CH-2 MYD-1257" },
    { value: "CH-2 OD POKAYOKE CH02", label: "CH-2 OD POKAYOKE CH02" },
    { value: "CH-2 OLM-C2A1", label: "CH-2 OLM-C2A1" },
    { value: "CH-2 OR-CH-2", label: "CH-2 OR-CH-2" },
    { value: "CH-2 SGB-997", label: "CH-2 SGB-997" },
    { value: "CH-2 SHG-1002", label: "CH-2 SHG-1002" },
    { value: "CH-2 SHG-840", label: "CH-2 SHG-840" },
    { value: "CH-2 SPC IR PY CH02", label: "CH-2 SPC IR PY CH02" },
    { value: "CH-2 SPC OR PY", label: "CH-2 SPC OR PY" },
    { value: "CH-2 SPC-1065", label: "CH-2 SPC-1065" },
    { value: "CH-2 SPC-1185", label: "CH-2 SPC-1185" },
    { value: "CH-2 SSB-1009", label: "CH-2 SSB-1009" },
    { value: "CH-2 SSB-1230", label: "CH-2 SSB-1230" },
    { value: "CH-2 TOL-1262", label: "CH-2 TOL-1262" },
    { value: "CH-2 WASH-1253", label: "CH-2 WASH-1253" },
    { value: "CH-2 XHH-1263-1", label: "CH-2 XHH-1263-1" },
    { value: "CH-2 XHH-1263-2", label: "CH-2 XHH-1263-2" },
  ],
};

export function getMachinesForChannel(channel: string): MachineOption[] {
  return CHANNEL_MACHINE_MAP[channel] || [];
}

import { Request, Response } from 'express';
import { OPCUAClient } from 'node-opcua';

export const getCumQty = async (_req: Request, res: Response) => {
  const endpointUrl = "opc.tcp://INPUN4CE403CJ6W.corp.skf.net:49320";
  const nodeId = "ns=2;s=Control Room.PLC_1.CH02_OEE.CH_02_LASER_PIECE_COUNT";

  const client = OPCUAClient.create({
    endpointMustExist: false,
  });

  try {
    await client.connect(endpointUrl);
    const session = await client.createSession();
    
    const dataValue = await session.readVariableValue(nodeId);

    await session.close();
    await client.disconnect();

    res.json({ success: true, value: dataValue.value.value });
  } catch (error: any) {
    console.error(error);
    try { await client.disconnect(); } catch (e) {}
    res.status(500).json({ error: error.message });
  }
};

interface BasePayload {
  roomId: string;
  userId: string;
}

interface Payload extends BasePayload {};

export interface Message {
  action: string;
  payload: Payload;
}
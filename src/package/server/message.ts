// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BasePayload {
  // 今のところは何もなし
}

export interface RequestPayload extends BasePayload {
  requestId: string
}

export interface PlayerEntryPayload extends RequestPayload {
  deck: string[]
  roomId: string;
  player: {
    name: string;
    id: string;
  }
}

export interface Message<T = BasePayload> {
  action: {
    handler: string;
    type: string;
  };
  payload: T;
}
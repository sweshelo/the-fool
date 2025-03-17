// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BasePayload {
  // 今のところは何もなし
}

export interface RequestPayload extends BasePayload {
  requestId: string
}

export interface PlayerEntryPayload extends RequestPayload {
  roomId: string;
  player: {
    name: string;
    id: string;
    deck: string[]
  }
}

export interface Message<T = BasePayload> {
  action: {
    handler: string;
    type: string;
  };
  payload: T;
}
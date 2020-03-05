export enum EventType {
  REGISTER,
  AUTH,
  UPDATE,
}

interface WebsocketEvent {
  type: EventType
  data: any
}

export type { WebsocketEvent }

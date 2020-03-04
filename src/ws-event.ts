export enum EventType {
  AUTH,
  UPDATE,
}

interface WebsocketEvent {
  type: EventType
  data: any
}

export type { WebsocketEvent }

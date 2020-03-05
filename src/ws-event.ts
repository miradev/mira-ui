export enum EventType {
  REGISTER,
  AUTH,
  UPDATE,
}

export interface WebsocketEvent {
  type: EventType
  data: any
}

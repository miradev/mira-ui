enum EventType {
  AUTH,
  UPDATE,
}

interface WebsocketEvent {
  type: EventType
  data: string
}

export { EventType, WebsocketEvent }

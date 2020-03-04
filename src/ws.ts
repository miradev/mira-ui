import * as WebSocket from "ws"
import type { WebsocketEvent } from "./ws-event"
import { EventType } from "./ws-event"
import * as hwid from "./hwid"

export default class WebsocketHandler {
  private ws: WebSocket

  constructor(ws: WebSocket) {
    this.ws = ws
  }

  public initialize() {
    this.ws.on("open", () => {
      this.send(EventType.AUTH, hwid)
    })

    this.ws.on("message", (data: string) => {
      try {
        const event: WebsocketEvent = JSON.parse(data)
        this.handleMessage(event.type, event.data)
      } catch (err) {
        console.error(`Received an unknown payload from the server: ${data}`)
      }
    })
  }

  private send(eventType: EventType, data: any) {
    const event: WebsocketEvent = {
      type: eventType,
      data: data
    }
    this.ws.send(JSON.stringify(event))
  }

  private handleMessage(type: EventType, data: any) {
    switch (type) {
      case EventType.AUTH:
        return this.handleAuthEvent(data)
      case EventType.UPDATE:
        return this.handleUpdateEvent(data)
    }
  }

  private handleAuthEvent(data: any) {}

  private handleUpdateEvent(data: any) {}
}

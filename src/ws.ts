import * as WebSocket from "ws"
import type { WebsocketEvent } from "./ws-event"
import { EventType } from "./ws-event"
import * as hwid from "./hwid"

const deviceId = hwid.mac + "-" + hwid.serial

export default class WebsocketHandler {
  private ws: WebSocket
  private token: string | null

  constructor(ws: WebSocket, token: string | null) {
    this.ws = ws
    this.token = token
  }

  public initialize() {
    this.ws.on("open", () => {
      // Send token if token exists, else send device hwid for registration
      if (this.token !== null) {
        this.send(EventType.AUTH, this.token)
      } else {
        this.send(EventType.REGISTER, deviceId)
      }
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
      case EventType.REGISTER:
        return this.handleRegisterEvent(data)
      case EventType.AUTH:
        return this.handleAuthEvent(data)
      case EventType.UPDATE:
        return this.handleUpdateEvent(data)
    }
  }

  private handleRegisterEvent(data: any) {}

  private handleAuthEvent(data: any) {}

  private handleUpdateEvent(data: any) {}
}

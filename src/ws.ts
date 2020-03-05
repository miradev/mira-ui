import type { WebsocketEvent } from "@/ws-event"
import * as hwid from "@/hwid"
import * as WebSocket from "ws"
import { writeToken } from "@/config"
import { EventType } from "@/ws-event"

const deviceId = hwid.mac + "-" + hwid.serial

export default class WebsocketHandler {
  private ws: WebSocket
  private miraDirectory: string
  private token: string | null

  constructor(ws: WebSocket, miraDirectory: string, token: string | null) {
    this.ws = ws
    this.token = token
    this.miraDirectory = miraDirectory
  }

  public initialize(): void {
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

  private send(eventType: EventType, data: any): void {
    const event: WebsocketEvent = {
      type: eventType,
      data: data
    }
    this.ws.send(JSON.stringify(event))
  }

  private handleMessage(type: EventType, data: any): void {
    switch (type) {
      case EventType.REGISTER:
        return this.handleRegisterEvent(data)
      case EventType.AUTH:
        return this.handleAuthEvent(data)
      case EventType.UPDATE:
        return this.handleUpdateEvent(data)
    }
  }

  private handleRegisterEvent(data: any): void {
    // Save token to file system
    writeToken(this.miraDirectory, data as string)
  }

  private handleAuthEvent(data: any): void {
    // TODO
    return
  }

  private handleUpdateEvent(data: any): void {
    // TODO
    return
  }
}

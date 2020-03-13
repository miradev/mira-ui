import type { WebsocketEvent } from "./ws-event"
import * as hwid from "./hwid"
import * as WebSocket from "ws"
import { writeToken, ServerConfig, removeTokenIfExists, UpdateData, writeWidgetSettings } from "./config"
import { EventType } from "./ws-event"
import * as api from "./api"
import { createWidgetSettings } from "./widget-settings"

const deviceId = hwid.mac + "-" + hwid.serial

export interface WSEventCallback {
  invalidToken?: () => void
  update?: () => void
}

export default class WebsocketHandler {
  private serverConfig: ServerConfig
  private ws!: WebSocket
  private miraDirectory: string
  private token: string | null
  private callbacks!: WSEventCallback

  constructor(serverConfig: ServerConfig, miraDirectory: string, token: string | null) {
    this.serverConfig = serverConfig
    this.miraDirectory = miraDirectory
    this.token = token
  }

  private newWebSocketConnection(): WebSocket {
    return new WebSocket(`ws://${this.serverConfig.serverUrl}:${this.serverConfig.serverPort}`)
  }

  public initialize(callbacks: WSEventCallback = {}): void {
    this.callbacks = callbacks
    this.ws = this.newWebSocketConnection()

    this.ws.on("error", (err: Error) => {
      console.log(err)
    })

    this.ws.on("close", (code: number, reason: string) => {
      if (code === 1008) {
        // Delete token file if exists
        removeTokenIfExists(this.miraDirectory)
        if (this.callbacks.invalidToken) {
          this.callbacks.invalidToken()
        }
      }
    })

    this.ws.on("message", (data: string) => {
      console.log("Received message: ", data)
      try {
        const event: WebsocketEvent = JSON.parse(data)
        this.handleMessage(event.type, event.data)
      } catch (err) {
        console.error(`Received an unknown payload from the server: ${data}`)
      }
    })

    this.ws.on("open", () => {
      // Send token if token exists, else send device hwid for registration
      if (this.token !== null) {
        this.send(EventType.AUTH, { deviceId: deviceId, token: this.token })
      } else {
        this.send(EventType.REGISTER, { deviceId: deviceId })
      }
    })
  }

  private send(eventType: EventType, data: string | object): void {
    const event: WebsocketEvent = {
      type: eventType,
      data: data
    }
    const strEvent = JSON.stringify(event)
    console.log("Sending message: ", strEvent)
    this.ws.send(strEvent)
  }

  private handleMessage(type: EventType, data: any): void {
    switch (type) {
      case EventType.REGISTER:
        return this.handleRegisterEvent(data)
      case EventType.AUTH:
        return this.handleAuthEvent(data)
      case EventType.UPDATE:
        return this.handleUpdateEvent(data as UpdateData)
    }
  }

  private handleRegisterEvent(data: any): void {
    // Save token to file system
    writeToken(this.miraDirectory, data as string)
    this.ws.close(1000)
  }

  private handleAuthEvent(data: any): void {
    // Logged in
    console.log("Successfully logged in using token.")
  }

  private handleUpdateEvent(data: UpdateData): void {
    const downloads = data.fileNames.map(fileName => {
      return api.downloadWidget({
        miraDirectory: this.miraDirectory,
        serverUrl: `${this.serverConfig.protocol}://${this.serverConfig.serverUrl}:${this.serverConfig.serverPort}`,
        widgetId: fileName,
        fileName: fileName
      })
    })
    Promise.all(downloads).then(() => {
      console.log("All downloads finished!")
      // Write output config
      const widgetSettings = createWidgetSettings(data.widgets)
      writeWidgetSettings(this.miraDirectory, widgetSettings)
      if (this.callbacks.update) {
        this.callbacks.update()
      }
    }).catch(err => {
      console.log("Something bad happened.", err)
    })
  }
}

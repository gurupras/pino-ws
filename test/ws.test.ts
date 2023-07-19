import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import express from 'express'
import WebSocket, { WebSocketServer } from 'ws'
import portfinder from 'portfinder'
import { Options } from '../src/ws'
import pino from 'pino'
import path from 'path'

describe('pino-ws', () => {
  let server: ReturnType<ReturnType<typeof express>['listen']>
  let socketPromise: Promise<WebSocket>
  let url: string
  beforeEach(async () => {
    const port = await portfinder.getPortPromise()
    const app = express()
    server = app.listen(port)
    const wss = new WebSocketServer({ noServer: true })
    socketPromise = new Promise<WebSocket>(resolve => {
      wss.on('connection', ws => {
        resolve(ws)
      })
    })
    server.on('upgrade', (req, socket, head) => {
      if (req.url === '/ws') {
        wss.handleUpgrade(req, socket, head, ws => {
          wss.emit('connection', ws)
        })
      } else {
        socket.destroy()
      }
    })
    url = `ws://localhost:${port}/ws`
  })

  afterEach(async () => {
    server?.close()
  })

  const createLogger = (options: Options = { url }) => {
    const transport = pino.transport({
      target: path.resolve(__dirname, '..', 'dist/index.js'),
      options
    })
    return pino(transport)
  }

  test('Able to set up socket', async () => {
    const log = createLogger()
    const ws = await socketPromise
    const promise = new Promise<void>(resolve => {
      ws.onmessage = e => {
        const obj: any = JSON.parse(e.data as string)
        resolve(obj)
      }
    })
    log.info('test')
    await expect(promise).resolves.toMatchObject({
      msg: 'test'
    })
  })
})
